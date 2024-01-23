import * as Schema from "@effect/schema/Schema"
import type * as Exit from "effect/Exit"

export interface WorkflowExecutionStateRunning {
  readonly _tag: "WorkflowExecutionStateRunning"
  readonly executionId: string
}

export interface WorkflowExecutionStateCompleted<E, A> {
  readonly _tag: "WorkflowExecutionStateCompleted"
  readonly executionId: string
  readonly exit: Exit.Exit<E, A>
}

export type WorkflowExecutionState<E, A> = WorkflowExecutionStateRunning | WorkflowExecutionStateCompleted<E, A>

export type WorkflowExecutionStateFrom<IE, IA> = {
  readonly _tag: "WorkflowExecutionStateRunning"
  readonly executionId: string
} | {
  readonly _tag: "WorkflowExecutionStateCompleted"
  readonly executionId: string
  readonly exit: Schema.ExitFrom<IE, IA>
}

export function schema<IE, E, IA, A>(
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
): Schema.Schema<WorkflowExecutionStateFrom<IE, IA>, WorkflowExecutionState<E, A>> {
  return Schema.union(
    Schema.struct({
      _tag: Schema.literal("WorkflowExecutionStateRunning"),
      executionId: Schema.string
    }),
    Schema.struct({
      _tag: Schema.literal("WorkflowExecutionStateCompleted"),
      executionId: Schema.string,
      exit: Schema.exit(failure, success)
    })
  )
}
