/**
 * @since 1.0.0
 */
import type * as Schema from "@effect/schema/Schema"
import type * as Data from "effect/Data"
import * as internal from "./internal/serializedEnvelope.js"
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
  }>
{}

/**
 * @since 1.0.0
 * @category models
 */
export namespace SerializedEnvelope {
  /**
   * @since 1.0.0
   * @category models
   */
  export interface From {
    readonly "@effect/cluster/SerializedEnvelope": "@effect/cluster/SerializedEnvelope"
    readonly entityId: string
    readonly entityType: string
    readonly body: SerializedMessage.SerializedMessage.From
  }
}

/**
 * Construct a new `SerializedEnvelope`
 *
 * @since 1.0.0
 * @category constructors
 */
export const make: (
  entityType: string,
  entityId: string,
  body: SerializedMessage.SerializedMessage
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
  SerializedEnvelope.From,
  SerializedEnvelope
> = internal.schema
