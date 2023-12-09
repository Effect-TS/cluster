import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import type * as Message from "../Message.js"
import * as MessageHeader from "../MessageHeader.js"
import * as MessageId from "../MessageId.js"

/** @intenal */
const MessageSymbolKey = "@effect/cluster/Message"

/** @internal */
export const MessageTypeId: Message.MessageTypeId = Symbol.for(MessageSymbolKey) as Message.MessageTypeId

/** @internal */
export function isMessage<R>(value: unknown): value is Message.Message<R> {
  return (
    typeof value === "object" &&
    value !== null &&
    MessageTypeId in value &&
    MessageHeader.isMessageHeader(value[MessageTypeId])
  )
}

/** @internal */
export function schema<RI, RA>(replySchema: Schema.Schema<RI, RA>) {
  return function<I extends object, A extends object>(
    item: Schema.Schema<I, A>
  ): Message.MessageSchema<I, A, RA> {
    const result = pipe(
      item,
      Schema.extend(
        Schema.rename(Schema.struct({ [MessageSymbolKey]: MessageHeader.schema(replySchema) }), {
          [MessageSymbolKey]: MessageTypeId
        })
      )
    )

    const make = (arg: A, messageId: MessageId.MessageId): A & Message.Message<RA> =>
      Data.struct({ ...arg, [MessageTypeId]: MessageHeader.make(messageId, replySchema) })

    const makeEffect = (arg: A): Effect.Effect<never, never, A & Message.Message<RA>> =>
      pipe(
        MessageId.makeEffect,
        Effect.map((messageId) => make(arg, messageId))
      )

    return { ...result, make, makeEffect } as any
  }
}
