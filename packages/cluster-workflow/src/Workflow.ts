import * as CrashableScheduler from "@effect/cluster-workflow/CrashableRuntime"
import * as DurableExecution from "@effect/cluster-workflow/DurableExecution"
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

      const check = () => Effect.unit

      const attemptExecution = () =>
        pipe(
          runtime.run(
            (restore) =>
              pipe(
                execute,
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
        DurableExecution.attempt(workflowId, failure, success)(check, attemptExecution),
        Effect.onInterrupt(() =>
          pipe(Ref.set(shouldInterruptOnFirstPendingActivity, true), Effect.zipRight(runtime.crash))
        )
      )
    })
  }
}
