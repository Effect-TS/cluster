import * as Message from "@effect/cluster/Message"
import * as RecipientType from "@effect/cluster/RecipientType"
import * as Schema from "@effect/schema/Schema"

export const GetCurrent = Message.schemaWithResult(Schema.never, Schema.number)(
  Schema.struct({
    _tag: Schema.literal("GetCurrent")
  })
)

export const Increment = Message.schema(
  Schema.struct({
    _tag: Schema.literal("Increment")
  })
)

export const Decrement = Message.schema(
  Schema.struct({
    _tag: Schema.literal("Decrement")
  })
)

export const CounterMsg = Schema.union(
  Increment,
  Decrement,
  GetCurrent
)

export type CounterMsg = Schema.Schema.To<typeof CounterMsg>

export const CounterEntity = RecipientType.makeEntityType("Counter", CounterMsg)
