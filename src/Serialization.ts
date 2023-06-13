import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import { Tag } from "@effect/data/Context";
import { pipe } from "@effect/data/Function";
import * as Schema from "@effect/schema/Schema";
import * as Parser from "@effect/schema/Parser";
import * as ShardError from "./ShardError";
import * as ByteArray from "./ByteArray";

/**
 * @since 1.0.0
 * @category symbols
 */
export const SerializationTypeId: unique symbol = Symbol.for(
  "@effect/shardcake/SerializationTypeId"
);

/**
 * @since 1.0.0
 * @category symbols
 */
export type SerializationTypeId = typeof SerializationTypeId;

/**
 * An interface to serialize user messages that will be sent between pods.
 */
export interface Serialization {
  [SerializationTypeId]: {};

  /**
   * Transforms the given message into binary
   */
  encode<A>(
    message: A,
    schema: Schema.Schema<A>
  ): Effect.Effect<never, ShardError.EncodeError, ByteArray.ByteArray>;

  /**
   * Transform binary back into the given type
   */
  decode<A>(
    bytes: ByteArray.ByteArray,
    schema: Schema.Schema<A>
  ): Effect.Effect<never, ShardError.DecodeError, A>;
}
export const Serialization = Tag<Serialization>();

/**
 * A layer that uses Java serialization for encoding and decoding messages.
 * This is useful for testing and not recommended to use in production.
 */
export const json = Layer.succeed(Serialization, {
  [SerializationTypeId]: {},
  encode: (message, schema) =>
    pipe(
      Parser.encodeEither(schema)(message),
      Effect.mapError(ShardError.EncodeError),
      Effect.flatMap((value) => Effect.sync(() => JSON.stringify(value))),
      Effect.map(ByteArray.byteArray)
    ),
  decode: (body, schema) =>
    pipe(
      Effect.sync(() => JSON.parse(body.value)),
      Effect.flatMap((value) => Parser.decodeEither(schema)(value)),
      Effect.mapError(ShardError.DecodeError)
    ),
});
