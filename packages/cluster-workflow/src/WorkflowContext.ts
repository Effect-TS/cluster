import { Effect } from "effect"
import * as Context from "effect/Context"
import * as Ref from "effect/Ref"

export interface WorkflowContext {
  workflowId: string
  shouldInterruptOnFirstPendingActivity: Ref.Ref<boolean>
}

export const WorkflowContext = Context.Tag<WorkflowContext>()

export function make(args: WorkflowContext): WorkflowContext {
  return args
}

export const shouldInterruptOnFirstPendingActivity = Effect.flatMap(
  WorkflowContext,
  (_) => Ref.get(_.shouldInterruptOnFirstPendingActivity)
)

export const setShouldInterruptOnFirstPendingActivity = (value: boolean) =>
  Effect.flatMap(
    WorkflowContext,
    (_) => Ref.set(_.shouldInterruptOnFirstPendingActivity, value)
  )
