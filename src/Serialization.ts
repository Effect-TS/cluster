import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import { Tag } from "@fp-ts/data/Context";
import { pipe } from "@fp-ts/data/Function";
import * as Option from "@fp-ts/data/Option";
import { PodAddress } from "./PodAddress";
import { Pods } from "./Pods";
import * as Schema from "@fp-ts/schema/Schema";
import * as These from "@fp-ts/data/These";
import * as Either from "@fp-ts/data/Either";
import * as ShardError from "./ShardError";

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
  encode<A>(message: A): Effect.Effect<never, never, unknown>;

  /**
   * Transform binary back into the given type
   */
  decode<A>(bytes: unknown): Effect.Effect<never, ShardError.DecodeError, A>;
}
export const Serialization = Tag<Serialization>();

/**
 * A layer that uses Java serialization for encoding and decoding messages.
 * This is useful for testing and not recommended to use in production.
 */
export const noop = Layer.succeed(Serialization)({
  [SerializationTypeId]: {},
  encode: (message) => Effect.succeed(message),
  decode: (body) => Effect.succeed(body as any),
});
