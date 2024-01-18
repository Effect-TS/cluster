import * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import * as ActivityState from "@effect/cluster-workflow/DurableExecutionState"
import type * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Ref from "effect/Ref"
import * as Stream from "effect/Stream"
import * as DurableExecutionEvent from "./DurableExecutionEvent.js"

export function attempt<IE, E, IA, A>(
  persistenceId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  const readState = pipe(
    DurableExecutionJournal.read(persistenceId, failure, success),
    Stream.runFold(
      ActivityState.initialState<E, A>(),
      (state, event) => ActivityState.foldDurableExecutionEvent(state, event)
    )
  )

  return <R>(
    execute: (state: ActivityState.DurableExecutionState<E, A>) => Effect.Effect<R, E, A>
  ) => {
    return pipe(
      readState,
      Effect.flatMap((state) =>
        pipe(
          ActivityState.match(state, {
            onPending: (state) =>
              pipe(
                Ref.make(state.lastSequence),
                Effect.flatMap((sequenceRef) => {
                  const persistEventIntoJournal = (
                    fn: (sequence: number) => DurableExecutionEvent.DurableExecutionEvent<E, A>
                  ) =>
                    pipe(
                      Ref.updateAndGet(sequenceRef, (_) => _ + 1),
                      Effect.flatMap((sequence) =>
                        DurableExecutionJournal.append(persistenceId, failure, success, fn(sequence))
                      )
                    )

                  return pipe(
                    persistEventIntoJournal(DurableExecutionEvent.DurableExecutionEventAttempted),
                    Effect.zipRight(execute(state)),
                    Effect.catchAllDefect((defect) => Effect.die(String(defect))),
                    Effect.exit,
                    Effect.tap((exit) =>
                      persistEventIntoJournal(
                        DurableExecutionEvent.ActivityCompleted(
                          exit
                        )
                      )
                    ),
                    Effect.onInterrupt(() =>
                      persistEventIntoJournal(
                        DurableExecutionEvent.DurableExecutionEventInterruptionRequested
                      )
                    ),
                    Effect.flatten
                  )
                })
              ),
            onCompleted: ({ exit }) => exit
          }),
          Effect.unified
        )
      )
    )
  }
}
