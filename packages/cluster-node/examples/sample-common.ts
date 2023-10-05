import * as Message from "@effect/cluster/Message"
import * as RecipientType from "@effect/cluster/RecipientType"
import * as StreamMessage from "@effect/cluster/StreamMessage"
import * as Schema from "@effect/schema/Schema"

export const [GetCurrent_, GetCurrent] = Message.schema(Schema.number)(
  Schema.struct({
    _tag: Schema.literal("GetCurrent")
  })
)

export const [SubscribeChanges_, SubscribeChanges] = StreamMessage.schema(Schema.number)(
  Schema.struct({
    _tag: Schema.literal("SubscribeChanges")
  })
)

export const CounterMsg = Schema.union(
  Schema.struct({
    _tag: Schema.literal("Increment")
  }),
  Schema.struct({
    _tag: Schema.literal("Decrement")
  }),
  GetCurrent_,
  SubscribeChanges_
)

export type CounterMsg = Schema.Schema.To<typeof CounterMsg>

export const CounterEntity = RecipientType.makeEntityType("Counter", CounterMsg)
