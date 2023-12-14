import { Parser, ParseResult } from "@effect/schema"
import * as Schema from "@effect/schema/Schema"
import * as Serializable from "@effect/schema/Serializable"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import type * as Message from "../Message.js"
import * as MessageId from "../MessageId.js"

/** @internal */
const MessageSymbolKey = "@effect/cluster/Message"

/** @internal */
export const MessageTypeId: Message.MessageTypeId = Symbol.for(MessageSymbolKey) as Message.MessageTypeId

/** @internal */
export function isMessage(value: unknown): value is Message.Message<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    MessageId.isMessageId(value.id)
  )
}

/** @internal */
export function messageId<Payload>(value: Message.Message<Payload>): MessageId.MessageId {
  return value.id
}

/** @internal */
export function schema<I, A>(
  payload: Schema.Schema<I, A>
): Message.MessageSchema<I, A> {
  const result = Schema.struct({
    id: MessageId.schema,
    headers: Schema.record(Schema.string, Schema.string),
    payload
  })

  return {
    ...result,
    make: (arg: A, messageId: MessageId.MessageId): Message.Message<A> => make(arg, messageId),
    makeEffect: (value: A): Effect.Effect<never, never, Message.Message<A>> => makeEffect(value)
  }
}

/** @internal */
export function isMessageWithResult(value: unknown): value is Message.MessageWithResult<unknown, unknown> {
  return (
    isMessage(value) &&
    Serializable.symbolResult in value
  )
}

/** @internal */
export function successSchema<Payload, Result>(
  message: Message.MessageWithResult<Payload, Result>
): Schema.Schema<unknown, Result> {
  return Serializable.successSchema(message)
}

/** @internal */
export function schemaWithResult<RI, RA>(success: Schema.Schema<RI, RA>) {
  return function<I, A>(
    payload: Schema.Schema<I, A>
  ): Message.MessageWithResultSchema<I, A, RA> {
    const result = Schema.declare(
      [],
      schema(payload),
      (isDecoding) => {
        const base = schema(payload)
        return (u, options) => {
          if (isDecoding) {
            return ParseResult.map(
              Parser.parse(base)(u, options),
              (u) => {
                return makeWithResult(u.payload, u.id, success, u.headers)
              }
            )
          } else {
            return Parser.encode(base)(u, options)
          }
        }
      }
    )

    const make = (arg: A, messageId: MessageId.MessageId): Message.MessageWithResult<A, RA> =>
      makeWithResult(arg, messageId, result)

    const makeEffect = (value: A): Effect.Effect<never, never, Message.MessageWithResult<A, RA>> =>
      makeWithResultEffect(value, result)

    return { ...result, make, makeEffect }
  }
}

/** @internal */
export function make<Payload>(
  payload: Payload,
  id: MessageId.MessageId,
  headers: Record<string, string> = {}
): Message.Message<Payload> {
  return ({ payload, id, headers })
}

/** @internal */
export function makeEffect<Payload>(
  message: Payload,
  headers: Record<string, string> = {}
): Effect.Effect<never, never, Message.Message<Payload>> {
  return pipe(
    MessageId.makeEffect,
    Effect.map((messageId) => make(message, messageId, headers))
  )
}

/** @internal */
export function makeWithResult<Payload, I, A>(
  payload: Payload,
  messageId: MessageId.MessageId,
  success: Schema.Schema<I, A>,
  headers: Record<string, string> = {}
): Message.MessageWithResult<Payload, A> {
  return Object.assign(make(payload, messageId, headers), {
    [Serializable.symbolResult]: { Failure: Schema.never, Success: success as any }
  })
}

/** @internal */
export function makeWithResultEffect<Payload, I, A>(
  payload: Payload,
  success: Schema.Schema<I, A>,
  headers: Record<string, string> = {}
): Effect.Effect<never, never, Message.MessageWithResult<Payload, A>> {
  return pipe(
    MessageId.makeEffect,
    Effect.map((messageId) => makeWithResult(payload, messageId, success, headers))
  )
}
