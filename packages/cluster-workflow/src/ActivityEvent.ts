import * as Schema from "@effect/schema/Schema"

export class ActivityAttempted extends Schema.TaggedClass<ActivityAttempted>()("ActivityAttempted", {
  sequence: Schema.Int
}) {}

export class ActivityCompleted extends Schema.TaggedClass<ActivityCompleted>()("ActivityCompleted", {
  sequence: Schema.Int,
  result: Schema.string
}) {}

export const schema = Schema.union(ActivityAttempted, ActivityCompleted)
export type ActivityEvent = Schema.Schema.To<typeof schema>

export function match<A, B = A>(
  fns: {
    onAttempted: (event: ActivityAttempted) => A
    onCompleted: (event: ActivityCompleted) => B
  }
) {
  return (event: ActivityEvent) => {
    switch (event._tag) {
      case "ActivityAttempted":
        return fns.onAttempted(event)
      case "ActivityCompleted":
        return fns.onCompleted(event)
    }
  }
}
