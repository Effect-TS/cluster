import * as Schema from "@effect/schema/Schema"

export class ActivityError extends Schema.TaggedClass<ActivityError>()("@effect/cluster-workflow/ActivityError", {
  error: Schema.string
}) {}
