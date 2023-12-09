import * as Message from "@effect/cluster/Message"
import * as RecipientType from "@effect/cluster/RecipientType"
import * as Schema from "@effect/schema/Schema"

export const GetCurrent = Message.schemaWithResult(Schema.number)(
  Schema.struct({
    _tag: Schema.literal("GetCurrent")
  })
)

const Increment = Message.schemaWithResult(Schema.any)(
  Schema.struct({
    _tag: Schema.literal("Increment")
  })
)

const Decrement = Message.schemaWithResult(Schema.any)(
  Schema.struct({
    _tag: Schema.literal("Increment")
  })
)

const CounterMsg = Schema.union(
  Increment,
  Decrement,
  GetCurrent
)

export type CounterMsg = Schema.Schema.To<typeof CounterMsg>

export const CounterEntity = RecipientType.makeEntityType("Counter", CounterMsg)
