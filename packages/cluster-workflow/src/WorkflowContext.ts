import { Effect } from "effect"
import * as Context from "effect/Context"
import type * as Scope from "effect/Scope"

export interface WorkflowContext {
  crash: Effect.Effect<never, never, void>
  restore: <R, E, A>(effect: Effect.Effect<R, E, A>) => Effect.Effect<R, E, A>
  executionScope: Scope.Scope
}

export const WorkflowContext = Context.Tag<WorkflowContext>()

export function make(args: WorkflowContext): WorkflowContext {
  return args
}

export const forkEffectInExecutionScope = <R, E, A>(fa: Effect.Effect<R, E, A>) =>
  Effect.flatMap(WorkflowContext, (_) => Effect.forkIn(fa, _.executionScope))

export const restore = <R, E, A>(effect: Effect.Effect<R, E, A>) =>
  Effect.flatMap(WorkflowContext, (_) => _.restore(effect))
