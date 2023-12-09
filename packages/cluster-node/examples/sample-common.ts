import * as Message from "@effect/cluster/Message"
import * as RecipientType from "@effect/cluster/RecipientType"
import * as Schema from "@effect/schema/Schema"

export const GetCurrent = Message.schemaWithResult(Schema.number)(
  Schema.struct({
    _tag: Schema.literal("GetCurrent")
  })
)

const CounterMsg = Schema.union(
  Schema.struct({
    _tag: Schema.literal("Increment")
  }),
  Schema.struct({
    _tag: Schema.literal("Decrement")
  }),
  GetCurrent
)

export type CounterMsg = Schema.Schema.To<typeof CounterMsg>

export const CounterEntity = RecipientType.makeEntityType("Counter", CounterMsg)
