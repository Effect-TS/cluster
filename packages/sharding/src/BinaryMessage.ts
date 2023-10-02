/**
 * @since 1.0.0
 */
import * as Data from "effect/Data"
import { pipe } from "effect/Function"
import type * as Option from "effect/Option"
import * as Schema from "@effect/schema/Schema"
import * as ByteArray from "@effect/sharding/ByteArray"
import * as ReplyId from "@effect/sharding/ReplyId"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/sharding/BinaryMessage"

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface BinaryMessage extends Schema.Schema.To<typeof schema> {}

/**
 * Construct a new `BinaryMessage`
 *
 * @since 1.0.0
 * @category constructors
 */
export function make(
  entityId: string,
  entityType: string,
  body: ByteArray.ByteArray,
  replyId: Option.Option<ReplyId.ReplyId>
): BinaryMessage {
  return Data.struct({ _id: TypeId, entityId, entityType, body, replyId })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isBinaryMessage(value: unknown): value is BinaryMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    "_id" in value &&
    value["_id"] === TypeId
  )
}

/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema = pipe(
  Schema.struct({
    _id: Schema.literal(TypeId),
    entityId: Schema.string,
    entityType: Schema.string,
    body: ByteArray.schema,
    replyId: Schema.option(ReplyId.schema)
  }),
  Schema.data
)
