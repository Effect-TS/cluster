/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as TreeFormatter from "@effect/schema/TreeFormatter"
import * as ByteArray from "@effect/sharding/ByteArray"
import * as ShardingError from "@effect/sharding/ShardingError"
import { Tag } from "effect/Context"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"

/** @internal */
function jsonStringify<I, A>(value: A, schema: Schema.Schema<I, A>) {
  return pipe(
    value,
    Schema.encode(schema),
    Effect.mapError((e) => ShardingError.ShardingErrorSerialization(TreeFormatter.formatErrors(e.errors))),
    Effect.map((_) => JSON.stringify(_))
  )
}

/** @internal */
function jsonParse<I, A>(value: string, schema: Schema.Schema<I, A>) {
  return pipe(
    Effect.sync(() => JSON.parse(value)),
    Effect.flatMap(Schema.decode(schema)),
    Effect.mapError((e) => ShardingError.ShardingErrorSerialization(TreeFormatter.formatErrors(e.errors)))
  )
}

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
  ) => Effect.Effect<never, ShardingError.ShardingErrorSerialization, ByteArray.ByteArray>

  /**
   * Transform binary back into the given type
   * @since 1.0.0
   */
  readonly decode: <I, A>(
    bytes: ByteArray.ByteArray,
    schema: Schema.Schema<I, A>
  ) => Effect.Effect<never, ShardingError.ShardingErrorSerialization, A>
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
