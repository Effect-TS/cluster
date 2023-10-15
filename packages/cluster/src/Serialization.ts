/**
 * @since 1.0.0
 */
import * as ByteArray from "@effect/cluster/ByteArray"
import * as ShardingError from "@effect/cluster/ShardingError"
import * as Schema from "@effect/schema/Schema"
import * as TreeFormatter from "@effect/schema/TreeFormatter"
import { Tag } from "effect/Context"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId: unique symbol = Symbol.for(
  "@effect/cluster/SerializationTypeId"
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
    schema: Schema.Schema<I, A>,
    message: A
  ) => Effect.Effect<never, ShardingError.ShardingErrorSerialization, ByteArray.ByteArray>

  /**
   * Transform binary back into the given type
   * @since 1.0.0
   */
  readonly decode: <I, A>(
    schema: Schema.Schema<I, A>,
    bytes: ByteArray.ByteArray
  ) => Effect.Effect<never, ShardingError.ShardingErrorSerialization, A>
}

/**
 * @since 1.0.0
 * @category context
 */
export const Serialization = Tag<Serialization>()

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
 * A layer that uses Java serialization for encoding and decoding messages.
 * This is useful for testing and not recommended to use in production.
 * @since 1.0.0
 * @category layers
 */
export const json = Layer.succeed(Serialization, {
  _id: TypeId,
  encode: (schema, message) =>
    pipe(
      jsonStringify(message, schema),
      Effect.map(ByteArray.make)
    ),
  decode: (schema, body) => jsonParse(body.value, schema)
})
