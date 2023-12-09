/**
 * @since 1.0.0
 */
import type * as Schema from "@effect/schema/Schema"
import * as internal from "./internal/messageHeader.js"
import type * as MessageId from "./MessageId.js"

/**
 * @since 1.0.0
 * @category symbols
 */
export const MessageHeaderTypeId: unique symbol = internal.MessageHeaderTypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export type MessageHeaderTypeId = typeof MessageHeaderTypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface MessageHeader<A> {
  readonly [MessageHeaderTypeId]: MessageHeaderTypeId
  readonly id: MessageId.MessageId
  readonly schema: Schema.Schema<unknown, A>
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const make: <I, A>(id: MessageId.MessageId, schema: Schema.Schema<I, A>) => MessageHeader<A> = internal.make

/**
 * @since 1.0.0
 * @category utils
 */
export const isMessageHeader: <A>(value: unknown) => value is MessageHeader<A> = internal.isMessageHeader

/**
 * @since 1.0.0
 * @category schema
 */
export const schema: <I, A>(schema: Schema.Schema<I, A>) => Schema.Schema<I, MessageHeader<A>> = internal.schema
