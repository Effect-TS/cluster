/**
 * @since 1.0.0
 */
import type * as Schema from "@effect/schema/Schema"
import type * as Context from "effect/Context"
import type * as Effect from "effect/Effect"
import type * as Layer from "effect/Layer"
import * as internal from "./internal/serialization.js"
import type * as SerializedMessage from "./SerializedMessage.js"
import type * as ShardingError from "./ShardingError.js"

/**
 * @since 1.0.0
 * @category symbols
 */
export const SerializationTypeId: unique symbol = internal.SerializationTypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export type SerializationTypeId = typeof SerializationTypeId

/**
 * An interface to serialize user messages that will be sent between pods.
 * @since 1.0.0
 * @category models
 */
export interface Serialization {
  /**
   * @since 1.0.0
   */
  readonly [SerializationTypeId]: SerializationTypeId

  /**
   * Transforms the given message into binary
   * @since 1.0.0
   */
  readonly encode: <I, A>(
    schema: Schema.Schema<I, A>,
    message: A
  ) => Effect.Effect<never, ShardingError.ShardingErrorSerialization, SerializedMessage.SerializedMessage>

  /**
   * Transform binary back into the given type
   * @since 1.0.0
   */
  readonly decode: <I, A>(
    schema: Schema.Schema<I, A>,
    bytes: SerializedMessage.SerializedMessage
  ) => Effect.Effect<never, ShardingError.ShardingErrorSerialization, A>
}

/**
 * @since 1.0.0
 * @category context
 */
export const Serialization: Context.Tag<Serialization, Serialization> = internal.serializationTag

/**
 * @since 1.0.0
 * @category constructors
 */
export const make: (args: Omit<Serialization, typeof SerializationTypeId>) => Serialization = internal.make

/**
 * A layer that uses JSON serialization for encoding and decoding messages.
 * This is useful for testing and not recommended to use in production.
 * @since 1.0.0
 * @category layers
 */
export const json: Layer.Layer<never, never, Serialization> = internal.json
