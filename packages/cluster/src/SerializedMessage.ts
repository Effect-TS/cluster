/**
 * @since 1.0.0
 */
import type * as Schema from "@effect/schema/Schema"
import * as internal from "./internal/serializedMessage.js"

/**
 * @since 1.0.0
 * @category symbols
 */
export const SerializedMessageTypeId: unique symbol = internal.SerializedMessageTypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export type SerializedMessageTypeId = typeof SerializedMessageTypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface SerializedMessage {
  readonly [SerializedMessageTypeId]: SerializedMessageTypeId
  readonly value: string
}

/**
 * @since 1.0.0
 * @category models
 */
export namespace SerializedMessage {
  /**
   * @since 1.0.0
   * @category models
   */
  export interface From {
    readonly "@effect/cluster/SerializedMessage": "@effect/cluster/SerializedMessage"
    readonly value: string
  }
}

/**
 * Construct a new `SerializedMessage` from its internal string value.
 *
 * @since 1.0.0
 * @category constructors
 */
export const make: (value: string) => SerializedMessage = internal.make

/**
 * @since 1.0.0
 * @category utils
 */
export const isSerializedMessage: (value: unknown) => value is SerializedMessage = internal.isSerializedMessage

/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema: Schema.Schema<
  SerializedMessage,
  SerializedMessage.From
> = internal.schema
