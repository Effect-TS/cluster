/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import { pipe } from "effect/Function"
import type * as Option from "effect/Option"
import * as ReplyId from "./ReplyId.js"
import * as SerializedMessage from "./SerializedMessage.js"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "./SerializedEnvelope"

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface SerializedEnvelope extends Schema.Schema.To<typeof schema> {}

/**
 * Construct a new `SerializedEnvelope`
 *
 * @since 1.0.0
 * @category constructors
 */
export function make(
  entityId: string,
  entityType: string,
  body: SerializedMessage.SerializedMessage,
  replyId: Option.Option<ReplyId.ReplyId>
): SerializedEnvelope {
  return Data.struct({ _id: TypeId, entityId, entityType, body, replyId })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isSerializedEnvelope(value: unknown): value is SerializedEnvelope {
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
    body: SerializedMessage.schema,
    replyId: Schema.option(ReplyId.schema)
  }),
  Schema.data
)
