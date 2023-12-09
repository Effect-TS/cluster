/**
 * @since 1.0.0
 */
import type * as Schema from "@effect/schema/Schema"
import type * as Data from "effect/Data"
import type * as Effect from "effect/Effect"
import * as internal from "./internal/messageId.js"

/**
 * @since 1.0.0
 * @category symbols
 */
export const MessageIdTypeId: unique symbol = internal.MessageIdTypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export type MessageIdTypeId = typeof MessageIdTypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface MessageId extends
  Data.Data<{
    readonly [MessageIdTypeId]: MessageIdTypeId
    readonly value: string
  }>
{}

/**
 * @since 1.0.0
 * @category utils
 */
export const isMessageId: (value: unknown) => value is MessageId = internal.isMessageId

/**
 * Construct a new `MessageId` from its internal id string value.
 *
 * @since 1.0.0
 * @category constructors
 */
export const make = internal.make

/**
 * Construct a new `MessageId` by internally building a UUID.
 *
 * @since 1.0.0
 * @category constructors
 */
export const makeEffect: Effect.Effect<never, never, MessageId> = internal.makeEffect

/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema: Schema.Schema<
  { readonly "@effect/cluster/MessageId": "@effect/cluster/MessageId"; readonly value: string },
  MessageId
> = internal.schema
