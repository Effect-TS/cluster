import * as CrashableScheduler from "@effect/cluster-workflow/CrashableRuntime"
import * as DurableExecution from "@effect/cluster-workflow/DurableExecution"
import * as ActivityState from "@effect/cluster-workflow/DurableExecutionState"
import * as WorkflowContext from "@effect/cluster-workflow/WorkflowContext"
import type * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Ref from "effect/Ref"

export function attempt<IE, E, IA, A>(
  workflowId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  return <R>(execute: Effect.Effect<R, E, A>) => {
    return Effect.gen(function*(_) {
      const runtime = yield* _(CrashableScheduler.make)
      const shouldInterruptOnFirstPendingActivity = yield* _(Ref.make(false))

      // if the execution is pending and interruption has been asked previously,
      // set a flag in the context such as the first pending interruptible activity will interrupt as it were from exit
      const attemptExecution = (state: ActivityState.DurableExecutionState<E, A>) =>
        pipe(
          runtime.run(
            (restoreEffectRuntime) =>
              pipe(
                ActivityState.match(state, {
                  onPending: ({ interruptedPreviously }) =>
                    Ref.set(shouldInterruptOnFirstPendingActivity, interruptedPreviously),
                  onCompleted: () => Effect.unit
                }),
                Effect.unified,
                Effect.zipRight(execute),
                Effect.provideService(
                  WorkflowContext.WorkflowContext,
                  WorkflowContext.make({
                    workflowId,
                    restoreEffectRuntime,
                    shouldInterruptOnFirstPendingActivity
                  })
                )
              )
          ),
          Effect.catchIf(CrashableScheduler.isCrashableRuntimeCrashedError, () => Effect.interrupt)
        )

      return yield* _(
        DurableExecution.attempt(workflowId, failure, success)(attemptExecution),
        Effect.onInterrupt(() => runtime.crash)
      )
    })
  }
}
