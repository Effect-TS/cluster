import type * as DurableExecutionEvent from "@effect/cluster-workflow/DurableExecutionEvent"
import * as DurableExecutionState from "@effect/cluster-workflow/DurableExecutionState"
import type * as Schema from "@effect/schema/Schema"
import { Ref } from "effect"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Stream from "effect/Stream"

export interface DurableExecutionJournal {
  read<IE, E, IA, A>(
    persistenceId: string,
    failure: Schema.Schema<IE, E>,
    success: Schema.Schema<IA, A>
  ): Stream.Stream<never, never, DurableExecutionEvent.DurableExecutionEvent<E, A>>
  append<IE, E, IA, A>(
    persistenceId: string,
    failure: Schema.Schema<IE, E>,
    success: Schema.Schema<IA, A>,
    event: DurableExecutionEvent.DurableExecutionEvent<E, A>
  ): Effect.Effect<never, never, void>
}

export const DurableExecutionJournal = Context.Tag<DurableExecutionJournal>()

export function append<IE, E, IA, A>(
  activityId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>,
  event: DurableExecutionEvent.DurableExecutionEvent<E, A>
) {
  return Effect.flatMap(
    DurableExecutionJournal,
    (journal) => journal.append(activityId, failure, success, event)
  )
}

export function read<IE, E, IA, A>(
  activityId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  return Stream.flatMap(DurableExecutionJournal, (journal) => journal.read(activityId, failure, success))
}

interface WithState<E, A, R2, E2, A2> {
  (
    state: DurableExecutionState.DurableExecutionState<E, A>,
    persist: (
      fn: (sequence: number) => DurableExecutionEvent.DurableExecutionEvent<E, A>
    ) => Effect.Effect<never, never, void>
  ): Effect.Effect<R2, E2, A2>
}

export function withState<IE, E, IA, A>(
  journal: DurableExecutionJournal,
  persistenceId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  return <R2, E2, A2>(fns: WithState<E, A, R2, E2, A2>) => {
    return pipe(
      journal.read(persistenceId, failure, success),
      Stream.runFold(
        DurableExecutionState.initialState<E, A>(),
        (state, event) => DurableExecutionState.foldDurableExecutionEvent(state, event)
      ),
      Effect.flatMap((state) =>
        pipe(
          Ref.make(state.lastSequence),
          Effect.flatMap((sequenceRef) => {
            const persistEventIntoJournal = (
              fn: (sequence: number) => DurableExecutionEvent.DurableExecutionEvent<E, A>
            ) =>
              pipe(
                Ref.updateAndGet(sequenceRef, (_) => _ + 1),
                Effect.flatMap((sequence) => journal.append(persistenceId, failure, success, fn(sequence)))
              )

            return fns(state, persistEventIntoJournal)
          })
        )
      )
    )
  }
}
