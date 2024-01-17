import * as ActivityContext from "@effect/cluster-workflow/ActivityContext"
import * as ActivityError from "@effect/cluster-workflow/ActivityError"
import * as ActivityState from "@effect/cluster-workflow/ActivityState"
import * as DurableExecution from "@effect/cluster-workflow/DurableExecution"
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
    return Effect.checkInterruptible((isInterruptible) => {
      const check = (state: ActivityState.ActivityState<E, A>) =>
        pipe(
          ActivityState.match(state, {
            onPending: () =>
              isInterruptible ?
                pipe(
                  WorkflowContext.setShouldInterruptOnFirstPendingActivity(false),
                  Effect.zipRight(Effect.interrupt),
                  Effect.whenEffect(WorkflowContext.shouldInterruptOnFirstPendingActivity),
                  Effect.asUnit
                ) :
                Effect.unit,
            onCompleted: () => Effect.unit
          }),
          Effect.unified
        )

      const attemptExecution = (currentAttempt: number) =>
        pipe(
          execute,
          Effect.provideService(ActivityContext.ActivityContext, { activityId, currentAttempt })
        )

      return pipe(
        DurableExecution.attempt(activityId, failure, success)(check, attemptExecution),
        Effect.catchAllDefect((defect) => Effect.fail(new ActivityError.ActivityError({ error: String(defect) }))),
        WorkflowContext.restore
      )
    })
  }
}

export const currentAttempt = Effect.map(ActivityContext.ActivityContext, (_) => _.currentAttempt)
