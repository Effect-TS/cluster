import * as Schema from "@effect/schema/Schema"
import * as Serializable from "@effect/schema/Serializable"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as PrimaryKey from "effect/PrimaryKey"
import type * as Message from "../Message.js"
import * as MessageId from "../MessageId.js"

/** @internal */
const MessageSymbolKey = "@effect/cluster/Message"

/** @internal */
export const MessageTypeId: Message.MessageTypeId = Symbol.for(MessageSymbolKey) as Message.MessageTypeId

/** @internal */
export function isMessage(value: unknown): value is Message.Message {
  return (
    typeof value === "object" &&
    value !== null &&
    PrimaryKey.symbol in value
  )
}

/** @internal */
export function messageId(value: Message.Message): MessageId.MessageId {
  return MessageId.make(PrimaryKey.value(value))
}

/** @internal */
export function isMessageWithResult<R>(value: unknown): value is Message.MessageWithResult<R> {
  return (
    isMessage(value) &&
    Serializable.symbolResult in value
  )
}

/** @internal */
export function successSchema<A>(message: Message.MessageWithResult<A>): Schema.Schema<unknown, A> {
  return Serializable.successSchema(message)
}

/** @internal */
export function schemaWithResult<RI, RA>(replySchema: Schema.Schema<RI, RA>) {
  return function<I extends object, A extends object>(
    item: Schema.Schema<I, A>
  ): Message.MessageSchema<I, A, RA> {
    const result = item // TODO:

    const make = (arg: A, messageId: MessageId.MessageId): A & Message.MessageWithResult<RA> =>
      Data.struct({
        ...arg,
        [PrimaryKey.symbol]: () => messageId.value,
        [Serializable.symbolResult]: { Failure: Schema.never, Success: replySchema }
      }) as any

    const makeEffect = (arg: A): Effect.Effect<never, never, A & Message.MessageWithResult<RA>> =>
      pipe(
        MessageId.makeEffect,
        Effect.map((messageId) => make(arg, messageId))
      )

    return { ...result, make, makeEffect } as any
  }
}

/** @internal */
export function makeEffect<A>(message: A): Effect.Effect<never, never, A & Message.Message> {
  return pipe(
    MessageId.makeEffect,
    Effect.map((messageId) => ({ ...message, [PrimaryKey.symbol]: () => messageId.value }))
  )
}
