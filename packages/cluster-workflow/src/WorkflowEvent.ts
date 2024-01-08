import * as SerializedMessage from "@effect/cluster/SerializedMessage"
import * as Schema from "@effect/schema/Schema"

export class WorkflowEventStarted extends Schema.TaggedClass<WorkflowEventStarted>()("WorkflowEventStarted", {
  sequence: Schema.Int,
  causationId: Schema.option(Schema.string),
  correlationId: Schema.option(Schema.string)
}) {}

export class WorkflowEventCompleted extends Schema.TaggedClass<WorkflowEventCompleted>()("WorkflowEventCompleted", {
  sequence: Schema.Int,
  result: Schema.either(SerializedMessage.schema, SerializedMessage.schema)
}) {}

export const WorkflowEvent = Schema.union(WorkflowEventStarted, WorkflowEventCompleted)
export type WorkflowEvent = Schema.Schema.To<typeof WorkflowEvent>
