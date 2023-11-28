/**
 * @since 1.0.0
 */
import type * as Schema from "@effect/schema/Schema"
import type * as Data from "effect/Data"
import type * as Option from "effect/Option"
import * as internal from "./internal/serializedEnvelope.js"
import type * as ReplyId from "./ReplyId.js"
import type * as SerializedMessage from "./SerializedMessage.js"

/**
 * @since 1.0.0
 * @category symbols
 */
export const SerializedEnvelopeTypeId: unique symbol = internal.SerializedEnvelopeTypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export type SerializedEnvelopeTypeId = typeof SerializedEnvelopeTypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface SerializedEnvelope extends
  Data.Data<{
    readonly [SerializedEnvelopeTypeId]: SerializedEnvelopeTypeId
    readonly entityId: string
    readonly entityType: string
    readonly body: SerializedMessage.SerializedMessage
    readonly replyId: Option.Option<ReplyId.ReplyId>
  }>
{}

/**
 * Construct a new `SerializedEnvelope`
 *
 * @since 1.0.0
 * @category constructors
 */
export const make: (
  entityType: string,
  entityId: string,
  body: SerializedMessage.SerializedMessage,
  replyId: Option.Option<ReplyId.ReplyId>
) => SerializedEnvelope = internal.make

/**
 * @since 1.0.0
 * @category utils
 */
export const isSerializedEnvelope: (value: unknown) => value is SerializedEnvelope = internal.isSerializedEnvelope

/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema: Schema.Schema<
  {
    readonly entityId: string
    readonly entityType: string
    readonly body: {
      readonly "@effect/cluster/SerializedMessage": "@effect/cluster/SerializedMessage"
      readonly value: string
    }
    readonly replyId: { readonly _tag: "None" } | {
      readonly _tag: "Some"
      readonly value: { readonly "@effect/cluster/ReplyId": "@effect/cluster/ReplyId"; readonly value: string }
    }
    readonly "@effect/cluster/SerializedEnvelope": "@effect/cluster/SerializedEnvelope"
  },
  SerializedEnvelope
> = internal.schema
