import * as CrashableScheduler from "@effect/cluster-workflow/CrashableScheduler"
import * as WorkflowContext from "@effect/cluster-workflow/WorkflowContext"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as FiberId from "effect/FiberId"
import * as FiberRef from "effect/FiberRef"
import { pipe } from "effect/Function"
import * as Scope from "effect/Scope"

export function attempt<R, E, A>(
  execute: Effect.Effect<R, E, A>
) {
  /**
   * Workflow execution semantic is kinda special.
   * An attempt of execution of a workflow runs with its own special scheduler, that emulates a "crash."
   */
  return Effect.gen(function*(_) {
    const outerScheduler = yield* _(FiberRef.get(FiberRef.currentScheduler))
    const executionScope = yield* _(Scope.make())

    const workflowContext = WorkflowContext.make({ outerScheduler, executionScope })
    const crashableScheduler = new CrashableScheduler.CrashableScheduler(outerScheduler)

    return yield* _(
      execute,
      Effect.provideService(WorkflowContext.WorkflowContext, workflowContext),
      Effect.withScheduler(crashableScheduler),
      Effect.onInterrupt(() =>
        pipe(
          Effect.sync(() => crashableScheduler.crash()),
          Effect.zipRight(Scope.close(executionScope, Exit.interrupt(FiberId.none)))
        )
      )
    )
  })
}
