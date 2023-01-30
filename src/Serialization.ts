import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import { Tag } from "@fp-ts/data/Context";
import { pipe } from "@fp-ts/core/Function";
import * as Option from "@fp-ts/core/Option";
import { PodAddress } from "./PodAddress";
import { Pods } from "./Pods";
import * as Schema from "@fp-ts/schema/Schema";
import * as Parser from "@fp-ts/schema/Parser";
import * as ParseError from "@fp-ts/schema/ParseResult";
import * as These from "@fp-ts/core/These";
import * as Either from "@fp-ts/core/Either";
import * as ShardError from "./ShardError";
import { ByteArray } from "./BinaryMessage";

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
  [SerializationTypeId]: {},
  encode: (message, schema) =>
    pipe(
      Effect.fromEither(Parser.encode(schema)(message)),
      Effect.mapError(ShardError.EncodeError)
    ),
  decode: (body, schema) =>
    pipe(Effect.fromEither(Parser.decode(schema)(body)), Effect.mapError(ShardError.DecodeError)),
});
