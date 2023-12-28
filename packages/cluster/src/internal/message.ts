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
export function isMessageWithResult(value: unknown): value is Message.MessageWithResult<unknown, unknown, unknown> {
  return (
    isMessage(value) &&
    Serializable.symbolResult in value
  )
}

/** @internal */
export function exitSchema<A extends Message.AnyWithResult>(
  message: A
): Schema.Schema<unknown, Message.Exit<A>> {
  return Serializable.exitSchema(message as any) as any
}

/** @internal */
export function schemaWithResult<REI, RE, RI, RA>(failure: Schema.Schema<REI, RE>, success: Schema.Schema<RI, RA>) {
  return function<I, A>(
    payload: Schema.Schema<I, A>
  ): Message.MessageWithResultSchema<I, A, RE, RA> {
    const result = pipe(
      Schema.declare(
        [],
        schema(payload),
        (isDecoding) => {
          const base = schema(payload)
          return (u, options) => {
            if (isDecoding) {
              return ParseResult.map(
                Parser.parse(base)(u, options),
                (u) => {
                  return makeWithResult(u.payload, u.id, failure, success, u.headers)
                }
              )
            } else {
              return Parser.encode(base)(u, options)
            }
          }
        }
      ),
      Schema.identifier("MessageWithResult")
    )

    const make = (arg: A, messageId: MessageId.MessageId): Message.MessageWithResult<A, RE, RA> =>
      makeWithResult(arg, messageId, failure, success)

    const makeEffect = (value: A): Effect.Effect<never, never, Message.MessageWithResult<A, RE, RA>> =>
      makeWithResultEffect(value, failure, success)

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
export function makeWithResult<Payload, IE, E, I, A>(
  payload: Payload,
  messageId: MessageId.MessageId,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<I, A>,
  headers: Record<string, string> = {}
): Message.MessageWithResult<Payload, E, A> {
  return Object.assign(make(payload, messageId, headers), {
    [Serializable.symbolResult]: { Failure: failure as any, Success: success as any }
  })
}

/** @internal */
export function makeWithResultEffect<Payload, IE, E, I, A>(
  payload: Payload,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<I, A>,
  headers: Record<string, string> = {}
): Effect.Effect<never, never, Message.MessageWithResult<Payload, E, A>> {
  return pipe(
    MessageId.makeEffect,
    Effect.map((messageId) => makeWithResult(payload, messageId, failure, success, headers))
  )
}
