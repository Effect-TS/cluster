/**
 * @since 1.0.0
 */
import type * as Schema from "@effect/schema/Schema"
import type * as Data from "effect/Data"
import type * as Effect from "effect/Effect"
import * as internal from "./internal/replyId.js"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ReplyIdTypeId: unique symbol = internal.ReplyIdTypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export type ReplyIdTypeId = typeof ReplyIdTypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface ReplyId extends
  Data.Data<{
    readonly [ReplyIdTypeId]: ReplyIdTypeId
    readonly value: string
  }>
{}

/**
 * @since 1.0.0
 * @category utils
 */
export const isReplyId: (value: unknown) => value is ReplyId = internal.isReplyId

/**
 * Construct a new `ReplyId` from its internal id string value.
 *
 * @since 1.0.0
 * @category constructors
 */
export const make = internal.make

/**
 * Construct a new `ReplyId` by internally building a UUID.
 *
 * @since 1.0.0
 * @category constructors
 */
export const makeEffect: Effect.Effect<never, never, ReplyId> = internal.makeEffect

/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema: Schema.Schema<
  { readonly "@effect/cluster/ReplyId": "@effect/cluster/ReplyId"; readonly value: string },
  ReplyId
> = internal.schema
