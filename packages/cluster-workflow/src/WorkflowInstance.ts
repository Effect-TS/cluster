import type * as Schema from "@effect/schema/Schema"

export interface WorkflowInstance<E, A> {
  workflowId: string
  failureSchema: Schema.Schema<unknown, E>
  successSchema: Schema.Schema<unknown, A>
}
