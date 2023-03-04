import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import { Tag } from "@effect/data/Context";
import { pipe } from "@effect/data/Function";
import * as Schema from "@fp-ts/schema/Schema";
import * as Parser from "@fp-ts/schema/Parser";
import * as ShardError from "./ShardError";
import { ByteArray } from "./BinaryMessage";

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId: unique symbol = Symbol.for("@effect/shardcake/SerializationTypeId");

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;

/**
 * An interface to serialize user messages that will be sent between pods.
 */
export interface Serialization {
  [TypeId]: {};

  /**
   * Transforms the given message into binary
   */
  encode<A>(
    message: A,
    schema: Schema.Schema<A>
  ): Effect.Effect<never, ShardError.EncodeError, ByteArray>;

  /**
   * Transform binary back into the given type
   */
  decode<A>(
    bytes: ByteArray,
    schema: Schema.Schema<A>
  ): Effect.Effect<never, ShardError.DecodeError, A>;
}
export const Serialization = Tag<Serialization>();

/**
 * A layer that uses Java serialization for encoding and decoding messages.
 * This is useful for testing and not recommended to use in production.
 */
export const noop = Layer.succeed(Serialization, {
  [TypeId]: {},
  encode: (message, schema) =>
    pipe(
      Effect.fromEither(Parser.encode(schema)(message)),
      Effect.mapError(ShardError.EncodeError)
    ),
  decode: (body, schema) =>
    pipe(Effect.fromEither(Parser.decode(schema)(body)), Effect.mapError(ShardError.DecodeError)),
});
