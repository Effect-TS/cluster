/**
 * @since 1.0.0
 */
import type * as Schema from "@effect/schema/Schema"
import type * as Serializable from "@effect/schema/Serializable"
import type * as Effect from "effect/Effect"
import type * as PrimaryKey from "effect/PrimaryKey"
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
export interface Message extends PrimaryKey.PrimaryKey {
}

/**
 * A `Message<A>` is a request from a data source for a value of type `A`
 *
 * @since 1.0.0
 * @category models
 */
export interface MessageWithResult<A> extends Message, Serializable.WithResult<never, never, unknown, A> {
}

/**
 * A `MessageSchema<From, To, A>` is an augmented schema that provides utilities to build the Message<A> with a valid replier.
 *
 * @since 1.0.0
 * @category models
 */
export interface MessageSchema<From, To, A>
  extends Schema.Schema<From & { "@effect/cluster/Message": string }, Types.Simplify<To & MessageWithResult<A>>>
{
  make: (message: To, messageId: MessageId.MessageId) => Types.Simplify<To & MessageWithResult<A>>
  makeEffect: (message: To) => Effect.Effect<never, never, Types.Simplify<To & MessageWithResult<A>>>
}

/**
 * Extracts the success type from a `Message<A>`.
 *
 * @since 1.0.0
 * @category utils
 */
export type Success<A> = A extends MessageWithResult<infer X> ? X : never

/**
 * @since 1.0.0
 * @category utils
 */
export const isMessageWithResult: <R>(value: unknown) => value is MessageWithResult<R> = internal.isMessageWithResult

/**
 * @since 1.0.0
 * @category utils
 */
export const isMessage: (value: unknown) => value is Message = internal.isMessage

/**
 * @since 1.0.0
 * @category utils
 */
export const messageId: (value: Message) => MessageId.MessageId = internal.messageId

/**
 * @since 1.0.0
 * @category utils
 */
export const successSchema: <A>(message: MessageWithResult<A>) => Schema.Schema<unknown, A> = internal.successSchema

/**
 * Creates both the schema and a constructor for a `Message<A>`
 *
 * @since 1.0.0
 * @category schema
 */
export const schemaWithResult: <RI, RA>(
  replySchema: Schema.Schema<RI, RA>
) => <I extends object, A extends object>(item: Schema.Schema<I, A>) => MessageSchema<I, A, RA> =
  internal.schemaWithResult

/**
 * @since 1.0.0
 * @category utils
 */
export const makeEffect = internal.makeEffect
