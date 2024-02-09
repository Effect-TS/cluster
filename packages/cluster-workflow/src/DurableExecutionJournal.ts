import type * as DurableExecutionEvent from "@effect/cluster-workflow/DurableExecutionEvent"
import * as DurableExecutionState from "@effect/cluster-workflow/DurableExecutionState"
import type * as Schema from "@effect/schema/Schema"
import { Ref } from "effect"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Stream from "effect/Stream"

export interface DurableExecutionJournal {
  read<A, IA, E, IE>(
    persistenceId: string,
    success: Schema.Schema<A, IA>,
    failure: Schema.Schema<E, IE>,
    fromSequence: number,
    keepReading: boolean
  ): Stream.Stream<DurableExecutionEvent.DurableExecutionEvent<A, E>>
  append<A, IA, E, IE>(
    persistenceId: string,
    success: Schema.Schema<A, IA>,
    failure: Schema.Schema<E, IE>,
    event: DurableExecutionEvent.DurableExecutionEvent<A, E>
  ): Effect.Effect<void>
}

export const DurableExecutionJournal = Context.GenericTag<DurableExecutionJournal>("@services/DurableExecutionJournal")

export function read<A, IA, E, IE>(
  activityId: string,
  success: Schema.Schema<A, IA>,
  failure: Schema.Schema<E, IE>,
  fromSequence: number,
  keepReading: boolean
) {
  return Stream.flatMap(
    DurableExecutionJournal,
    (journal) => journal.read(activityId, success, failure, fromSequence, keepReading)
  )
}

export function append<A, IA, E, IE>(
  activityId: string,
  success: Schema.Schema<A, IA>,
  failure: Schema.Schema<E, IE>,
  event: DurableExecutionEvent.DurableExecutionEvent<A, E>
) {
  return Effect.flatMap(
    DurableExecutionJournal,
    (journal) => journal.append(activityId, success, failure, event)
  )
}

interface WithState<A, E, A2, E2, R2> {
  (
    state: DurableExecutionState.DurableExecutionState<A, E>,
    persist: (
      fn: (sequence: number) => DurableExecutionEvent.DurableExecutionEvent<A, E>
    ) => Effect.Effect<void>
  ): Effect.Effect<A2, E2, R2>
}

export function withState<A, IA, E, IE>(
  journal: DurableExecutionJournal,
  persistenceId: string,
  success: Schema.Schema<A, IA>,
  failure: Schema.Schema<E, IE>
) {
  return <A2, E2, R2>(fns: WithState<A, E, R2, E2, A2>) => {
    return pipe(
      journal.read(persistenceId, success, failure, 0, false),
      Stream.runFold(
        DurableExecutionState.initialState<A, E>(),
        (state, event) => DurableExecutionState.foldDurableExecutionEvent(state, event)
      ),
      Effect.flatMap((state) =>
        pipe(
          Ref.make(state.lastSequence),
          Effect.flatMap((sequenceRef) => {
            const persistEventIntoJournal = (
              fn: (sequence: number) => DurableExecutionEvent.DurableExecutionEvent<A, E>
            ) =>
              pipe(
                Ref.updateAndGet(sequenceRef, (_) => _ + 1),
                Effect.flatMap((sequence) => journal.append(persistenceId, success, failure, fn(sequence)))
              )

            return fns(state, persistEventIntoJournal)
          })
        )
      )
    )
  }
}
