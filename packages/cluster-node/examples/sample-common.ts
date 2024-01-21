import * as RecipientType from "@effect/cluster/RecipientType"
import * as Schema from "@effect/schema/Schema"

export class GetCurrent extends Schema.TaggedRequest<GetCurrent>()("GetCurrent", Schema.never, Schema.number, {
  messageId: Schema.string
}) {}

export class Increment extends Schema.TaggedClass<Increment>()("Increment", {
  messageId: Schema.string
}) {}

export class Decrement extends Schema.TaggedClass<Decrement>()("Decrement", {
  messageId: Schema.string
}) {}

export const CounterMsg = Schema.union(
  Increment,
  Decrement,
  GetCurrent
)

export type CounterMsg = Schema.Schema.To<typeof CounterMsg>

export const CounterEntity = RecipientType.makeEntityType("Counter", CounterMsg, (_) => _.messageId)
