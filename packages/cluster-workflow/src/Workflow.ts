import * as CrashableScheduler from "@effect/cluster-workflow/CrashableRuntime"
import * as DurableExecution from "@effect/cluster-workflow/DurableExecution"
import * as ActivityState from "@effect/cluster-workflow/DurableExecutionState"
import * as WorkflowContext from "@effect/cluster-workflow/WorkflowContext"
import type * as Schema from "@effect/schema/Schema"
import { Exit } from "effect"
import * as Effect from "effect/Effect"
import * as FiberId from "effect/FiberId"
import { pipe } from "effect/Function"
import * as Ref from "effect/Ref"
import * as Scope from "effect/Scope"

export function attempt<IE, E, IA, A>(
  workflowId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  return <R>(execute: Effect.Effect<R, E, A>) => {
    return Effect.gen(function*(_) {
      const runtime = yield* _(CrashableScheduler.make)
      const shouldInterruptOnFirstPendingActivity = yield* _(Ref.make(false))
      const executionScope = yield* _(Scope.make())

      // if the execution is pending and interruption has been asked previously,
      // set a flag in the context such as the first pending interruptible activity will interrupt as it were from exit

      const attemptExecution = (state: ActivityState.DurableExecutionState<E, A>) =>
        pipe(
          runtime.run(
            (restore) =>
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
                    crash: runtime.crash,
                    restore,
                    shouldInterruptOnFirstPendingActivity
                  })
                )
              )
          ),
          Effect.catchIf(CrashableScheduler.isCrashableRuntimeCrashedError, () => Effect.interrupt)
        )

      return yield* _(
        DurableExecution.attempt(workflowId, failure, success)(attemptExecution),
        Effect.forkIn(executionScope),
        Effect.onInterrupt(() =>
          pipe(
            Scope.close(executionScope, Exit.interrupt(FiberId.none)),
            Effect.zipRight(runtime.crash)
          )
        ),
        Effect.flatMap((fiber) => fiber.await),
        Effect.flatten
      )
    })
  }
}
