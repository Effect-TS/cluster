/**
 * @since 1.0.0
 */
import type * as Schema from "@effect/schema/Schema"
import type * as Serializable from "@effect/schema/Serializable"
import type * as Effect from "effect/Effect"
import type * as Exit_ from "effect/Exit"
import type * as Types from "effect/Types"
import * as internal from "./internal/message.js"
import type * as MessageId from "./MessageId.js"

/**
 * @since 1.0.0
 * @category symbols
 */
export const MessageTypeId: unique symbol = internal.MessageTypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export type MessageTypeId = typeof MessageTypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface Message<Payload> {
  id: MessageId.MessageId
  headers: Record<string, string>
  payload: Payload
}

/**
 * @since 1.0.0
 * @category models
 */
export interface Any extends Message<any> {}

/**
 * @since 1.0.0
 * @category models
 */
export interface MessageSchema<From, To> extends
  Schema.Schema<
    {
      readonly id: { readonly "@effect/cluster/MessageId": "@effect/cluster/MessageId"; readonly value: string }
      readonly headers: { readonly [x: string]: string }
      readonly payload: From
    },
    Message<To>
  >
{
  make: (message: To, messageId: MessageId.MessageId) => Message<To>
  makeEffect: (message: To) => Effect.Effect<never, never, Message<To>>
}

/**
 * A `Message<A>` is a request from a data source for a value of type `A`
 *
 * @since 1.0.0
 * @category models
 */
export interface MessageWithResult<Payload, Failure, Success>
  extends Message<Payload>, Serializable.WithResult<unknown, Failure, unknown, Success>
{
}

/**
 * @since 1.0.0
 * @category models
 */
export type AnyWithResult = MessageWithResult<any, never, any> | MessageWithResult<any, any, any>

/**
 * A `MessageSchema<From, To, A>` is an augmented schema that provides utilities to build the Message<A> with a valid replier.
 *
 * @since 1.0.0
 * @category models
 */
export interface MessageWithResultSchema<From, To, Failure, Success> extends
  Schema.Schema<
    Types.Simplify<
      From & {
        readonly "@effect/cluster/Message": {
          readonly "@effect/cluster/MessageId": "@effect/cluster/MessageId"
          readonly value: string
        }
      }
    >,
    MessageWithResult<To, Failure, Success>
  >
{
  make: (message: To, messageId: MessageId.MessageId) => MessageWithResult<To, Failure, Success>
  makeEffect: (message: To) => Effect.Effect<never, never, MessageWithResult<To, Failure, Success>>
}

/**
 * Extracts the success type from a `MessageWithResult<A, S>`.
 *
 * @since 1.0.0
 * @category utils
 */
export type Success<S> = S extends MessageWithResult<any, any, infer X> ? X : never

/**
 * Extracts the success type from a `MessageWithResult<A, S>`.
 *
 * @since 1.0.0
 * @category utils
 */
export type Failure<S> = S extends MessageWithResult<any, infer X, any> ? X : never

/**
 * Extracts the payload type from a `Message<A>`.
 *
 * @since 1.0.0
 * @category utils
 */
export type Payload<S> = S extends Message<infer X> ? X : never

/**
 * Extracts the success type from a `MessageWithResult<A, S>`.
 *
 * @since 1.0.0
 * @category utils
 */
export type Exit<S> = S extends MessageWithResult<any, infer E, infer A> ? Exit_.Exit<E, A> : never

/**
 * @since 1.0.0
 * @category utils
 */
export const isMessageWithResult: (value: unknown) => value is MessageWithResult<unknown, unknown, unknown> =
  internal.isMessageWithResult

/**
 * @since 1.0.0
 * @category utils
 */
export const isMessage: (value: unknown) => value is Message<unknown> = internal.isMessage

/**
 * @since 1.0.0
 * @category utils
 */
export const messageId: <Payload>(value: Message<Payload>) => MessageId.MessageId = internal.messageId

/**
 * @since 1.0.0
 * @category utils
 */
export const exitSchema: <A extends AnyWithResult>(message: A) => Schema.Schema<unknown, Exit<A>> = internal.exitSchema

/**
 * Creates both the schema and a constructor for a `MessageWithResult<A>`
 *
 * @since 1.0.0
 * @category schema
 */
export const schemaWithResult: <REI, RE, RI, RA>(
  failure: Schema.Schema<REI, RE>,
  success: Schema.Schema<RI, RA>
) => <I, A>(payload: Schema.Schema<I, A>) => MessageWithResultSchema<I, A, RE, RA> = internal.schemaWithResult

/**
 * @since 1.0.0
 * @category utils
 */
export const makeEffect = internal.makeEffect

/**
 * Creates both the schema and a constructor for a `Message`
 *
 * @since 1.0.0
 * @category schema
 */
export const schema: <I, A>(payload: Schema.Schema<I, A>) => MessageSchema<I, A> = internal.schema
