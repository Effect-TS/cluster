import * as CrashableScheduler from "@effect/cluster-workflow/CrashableRuntime"
import * as WorkflowContext from "@effect/cluster-workflow/WorkflowContext"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as FiberId from "effect/FiberId"
import { pipe } from "effect/Function"
import * as Scope from "effect/Scope"

export function attempt<R, E, A>(
  execute: Effect.Effect<R, E, A>
) {
  return Effect.gen(function*(_) {
    const executionScope = yield* _(Scope.make())
    const runtime = yield* _(CrashableScheduler.make)

    return yield* _(
      runtime.run(
        (restore) =>
          pipe(
            execute,
            Effect.provideService(
              WorkflowContext.WorkflowContext,
              WorkflowContext.make({ crash: runtime.crash, restore, executionScope })
            )
          )
      ),
      Effect.onInterrupt(() =>
        pipe(
          runtime.crash,
          Effect.zipRight(Scope.close(executionScope, Exit.interrupt(FiberId.none)))
        )
      )
    )
  })
}
