import * as ActivityJournal from "@effect/cluster-workflow/ActivityJournal"
import * as ActivityState from "@effect/cluster-workflow/ActivityState"
import type * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Ref from "effect/Ref"
import * as Stream from "effect/Stream"
import * as ActivityEvent from "./ActivityEvent.js"

export function attempt<IE, E, IA, A>(
  persistenceId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  const readState = pipe(
    ActivityJournal.readJournal(persistenceId, failure, success),
    Stream.runFold(
      ActivityState.initialState<E, A>(),
      (state, event) => ActivityState.foldActivityEvent(state, event)
    )
  )

  return <R>(execute: (attempt: number, interruptedPreviously: boolean) => Effect.Effect<R, E, A>) => {
    return Effect.interruptibleMask((restore) =>
      pipe(
        readState,
        Effect.flatMap((state) =>
          pipe(
            ActivityState.match(state, {
              onPending: (state) =>
                pipe(
                  Ref.make(state.lastSequence),
                  Effect.flatMap((sequenceRef) => {
                    const persistEventIntoJournal = (fn: (sequence: number) => ActivityEvent.ActivityEvent<E, A>) =>
                      pipe(
                        Ref.updateAndGet(sequenceRef, (_) => _ + 1),
                        Effect.flatMap((sequence) =>
                          ActivityJournal.persistJournal(persistenceId, failure, success, fn(sequence))
                        )
                      )

                    return pipe(
                      persistEventIntoJournal(ActivityEvent.ActivityAttempted),
                      Effect.zipRight(restore(execute(state.currentAttempt, state.interruptedPreviously))),
                      Effect.catchAllDefect((defect) => Effect.die(String(defect))),
                      Effect.exit,
                      Effect.tap((exit) =>
                        persistEventIntoJournal(
                          ActivityEvent.ActivityCompleted(
                            exit
                          )
                        )
                      ),
                      Effect.onInterrupt(() =>
                        persistEventIntoJournal(
                          ActivityEvent.ActivityInterruptionRequested
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
    )
  }
}
