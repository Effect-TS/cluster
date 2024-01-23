import type * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import { Effect } from "effect"
import * as Context from "effect/Context"
import * as Ref from "effect/Ref"

export interface WorkflowContext {
  workflowId: string
  shouldInterruptCurrentFiberInActivity: Ref.Ref<boolean>
  durableExecutionJournal: DurableExecutionJournal.DurableExecutionJournal
}

export const WorkflowContext = Context.Tag<WorkflowContext>()

export function make(args: WorkflowContext): WorkflowContext {
  return args
}

export const shouldInterruptCurrentFiberInActivity = Effect.flatMap(
  WorkflowContext,
  (_) => Ref.get(_.shouldInterruptCurrentFiberInActivity)
)

export const setShouldInterruptCurrentFiberInActivity = (value: boolean) =>
  Effect.flatMap(
    WorkflowContext,
    (_) => Ref.set(_.shouldInterruptCurrentFiberInActivity, value)
  )

export const durableExecutionJournal = Effect.map(WorkflowContext, (_) => _.durableExecutionJournal)
