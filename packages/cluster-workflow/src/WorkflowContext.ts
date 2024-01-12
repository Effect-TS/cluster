import { Effect } from "effect"
import * as Context from "effect/Context"
import type * as Scheduler from "effect/Scheduler"
import type * as Scope from "effect/Scope"

export interface WorkflowContext {
  outerScheduler: Scheduler.Scheduler
  executionScope: Scope.Scope
}

export const WorkflowContext = Context.Tag<WorkflowContext>()

export function make(args: WorkflowContext): WorkflowContext {
  return args
}

export function withOuterScheduler<R, E, A>(effect: Effect.Effect<R, E, A>) {
  return Effect.flatMap(WorkflowContext, (_) => Effect.withScheduler(effect, _.outerScheduler))
}

export function forkEffectInExecutionScope<R, E, A>(effect: Effect.Effect<R, E, A>) {
  return Effect.flatMap(WorkflowContext, (_) => Effect.forkIn(effect, _.executionScope))
}
