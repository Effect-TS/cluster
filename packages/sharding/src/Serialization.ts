/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context"
import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import type * as Schema from "@effect/schema/Schema"
import * as ByteArray from "@effect/sharding/ByteArray"
import type * as ShardingError from "@effect/sharding/ShardingError"
import { jsonParse, jsonStringify } from "./utils"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId: unique symbol = Symbol.for(
  "@effect/sharding/SerializationTypeId"
)

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * An interface to serialize user messages that will be sent between pods.
 * @since 1.0.0
 * @category models
 */
export interface Serialization {
  /**
   * @since 1.0.0
   */
  readonly _id: TypeId

  /**
   * Transforms the given message into binary
   * @since 1.0.0
   */
  readonly encode: <I, A>(
    message: A,
    schema: Schema.Schema<I, A>
  ) => Effect.Effect<never, ShardingError.ShardingSerializationError, ByteArray.ByteArray>

  /**
   * Transform binary back into the given type
   * @since 1.0.0
   */
  readonly decode: <I, A>(
    bytes: ByteArray.ByteArray,
    schema: Schema.Schema<I, A>
  ) => Effect.Effect<never, ShardingError.ShardingSerializationError, A>
}

/**
 * @since 1.0.0
 * @category context
 */
export const Serialization = Tag<Serialization>()

/**
 * A layer that uses Java serialization for encoding and decoding messages.
 * This is useful for testing and not recommended to use in production.
 * @since 1.0.0
 * @category layers
 */
export const json = Layer.succeed(Serialization, {
  _id: TypeId,
  encode: (message, schema) =>
    pipe(
      jsonStringify(message, schema),
      Effect.map(ByteArray.make)
    ),
  decode: (body, schema) => jsonParse(body.value, schema)
})
