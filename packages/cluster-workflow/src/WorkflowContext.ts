import { Effect } from "effect"
import * as Context from "effect/Context"
import * as Ref from "effect/Ref"

export interface WorkflowContext {
  workflowId: string
  crash: Effect.Effect<never, never, void>
  restore: <R, E, A>(effect: Effect.Effect<R, E, A>) => Effect.Effect<R, E, A>
  shouldInterruptOnFirstPendingActivity: Ref.Ref<boolean>
}

export const WorkflowContext = Context.Tag<WorkflowContext>()

export function make(args: WorkflowContext): WorkflowContext {
  return args
}

export const restore = <R, E, A>(effect: Effect.Effect<R, E, A>) =>
  Effect.flatMap(WorkflowContext, (_) => _.restore(effect))

export const shouldInterruptOnFirstPendingActivity = Effect.flatMap(
  WorkflowContext,
  (_) => Ref.get(_.shouldInterruptOnFirstPendingActivity)
)

export const setShouldInterruptOnFirstPendingActivity = (value: boolean) =>
  Effect.flatMap(
    WorkflowContext,
    (_) => Ref.set(_.shouldInterruptOnFirstPendingActivity, value)
  )
