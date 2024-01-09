import * as Schema from "@effect/schema/Schema"

export class ActivityAttempted extends Schema.TaggedClass<ActivityAttempted>()("ActivityAttempted", {
  sequence: Schema.Int
}) {}

export class ActivityFailed extends Schema.TaggedClass<ActivityFailed>()("ActivityFailed", {
  sequence: Schema.Int,
  result: Schema.string
}) {}

export class ActivitySucceeded extends Schema.TaggedClass<ActivitySucceeded>()("ActivitySucceeded", {
  sequence: Schema.Int,
  result: Schema.string
}) {}

export class ActivityCompleted extends Schema.TaggedClass<ActivityCompleted>()("ActivityCompleted", {
  sequence: Schema.Int
}) {}

export const schema = Schema.union(ActivityAttempted, ActivityFailed, ActivitySucceeded, ActivityCompleted)
export type ActivityEvent = Schema.Schema.To<typeof schema>

export function match<A, B = A, C = B, D = C>(
  fns: {
    onAttempted: (event: ActivityAttempted) => A
    onFailed: (event: ActivityFailed) => B
    onSucceeded: (event: ActivitySucceeded) => C
    onCompleted: (event: ActivityCompleted) => D
  }
) {
  return (event: ActivityEvent) => {
    switch (event._tag) {
      case "ActivityAttempted":
        return fns.onAttempted(event)
      case "ActivityFailed":
        return fns.onFailed(event)
      case "ActivitySucceeded":
        return fns.onSucceeded(event)
      case "ActivityCompleted":
        return fns.onCompleted(event)
    }
  }
}
