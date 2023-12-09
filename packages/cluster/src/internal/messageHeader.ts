import * as Schema from "@effect/schema/Schema"
import type * as MessageHeader from "../MessageHeader.js"
import * as MessageId from "../MessageId.js"

/** @internal  */
const MessageHeaderSymbolKey = "@effect/cluster/MessageHeader"

/** @internal */
export const MessageHeaderTypeId: MessageHeader.MessageHeaderTypeId = Symbol.for(
  MessageHeaderSymbolKey
) as MessageHeader.MessageHeaderTypeId

/** @internal */
export function make<I, A>(id: MessageId.MessageId, schema: Schema.Schema<I, A>): MessageHeader.MessageHeader<A> {
  return {
    [MessageHeaderTypeId]: MessageHeaderTypeId,
    id,
    schema: schema as any
  }
}

/** @internal */
export function isMessageHeader<A>(value: unknown): value is MessageHeader.MessageHeader<A> {
  return typeof value === "object" && value !== null && MessageHeaderTypeId in value &&
    value[MessageHeaderTypeId] === MessageHeaderTypeId
}

/** @internal */
export const schema = <I, A>(schema: Schema.Schema<I, A>): Schema.Schema<I, MessageHeader.MessageHeader<A>> => {
  return Schema.transform(
    MessageId.schema,
    Schema.unknown,
    (id) => make(id, schema) as any,
    (_) => {
      return (_ as any).id
    }
  ) as any
}
