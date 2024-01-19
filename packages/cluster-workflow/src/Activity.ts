import * as ActivityContext from "@effect/cluster-workflow/ActivityContext"
import * as DurableExecutionEvent from "@effect/cluster-workflow/DurableExecutionEvent"
import * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import * as ActivityState from "@effect/cluster-workflow/DurableExecutionState"
import * as WorkflowContext from "@effect/cluster-workflow/WorkflowContext"
import type * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"

export function attempt<IE, E, IA, A>(
  activityId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  return <R>(execute: Effect.Effect<R, E, A>) => {
    return DurableExecutionJournal.withState(activityId, failure, success)(
      (state, persistEvent) => {
        const interruptCurrentFiber = pipe(
          WorkflowContext.setShouldInterruptOnFirstPendingActivity(false),
          Effect.zipRight(Effect.interrupt)
        )

        const beginInterruptionIfInterruptible = Effect.checkInterruptible((isInterruptible) =>
          pipe(
            persistEvent(DurableExecutionEvent.DurableExecutionEventInterruptionRequested),
            Effect.zipRight(persistEvent(DurableExecutionEvent.DurableExecutionEventInterruptionCompleted)),
            Effect.zipRight(interruptCurrentFiber),
            Effect.when(() => isInterruptible),
            Effect.whenEffect(WorkflowContext.shouldInterruptOnFirstPendingActivity),
            Effect.asUnit
          )
        )

        return pipe(
          ActivityState.match(state, {
            onPending: ({ currentAttempt }) =>
              pipe(
                beginInterruptionIfInterruptible,
                Effect.zipRight(persistEvent(DurableExecutionEvent.DurableExecutionEventAttempted)),
                Effect.zipRight(execute),
                Effect.catchAllDefect((defect) => Effect.die(String(defect))),
                Effect.exit,
                Effect.tap((exit) => persistEvent(DurableExecutionEvent.ActivityCompleted(exit))),
                Effect.flatten,
                Effect.provideService(ActivityContext.ActivityContext, { activityId, currentAttempt })
              ),
            onWindDown: () =>
              pipe(
                persistEvent(DurableExecutionEvent.DurableExecutionEventInterruptionCompleted),
                Effect.zipRight(interruptCurrentFiber)
              ),
            onFiberInterrupted: () => interruptCurrentFiber,
            onCompleted: ({ exit }) => Effect.flatMap(Effect.unit, () => exit)
          }),
          Effect.unified
        )
      }
    )
  }
}

export const currentAttempt = Effect.map(ActivityContext.ActivityContext, (_) => _.currentAttempt)
