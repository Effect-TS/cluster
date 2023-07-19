/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context";
import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as ByteArray from "@effect/shardcake/ByteArray";
import * as ShardError from "@effect/shardcake/ShardError";
import { jsonParse, jsonStringify } from "./utils";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = /*#__PURE__*/Symbol.for("@effect/shardcake/SerializationTypeId");
/**
 * @since 1.0.0
 * @category context
 */
export const Serialization = /*#__PURE__*/Tag();
/**
 * A layer that uses Java serialization for encoding and decoding messages.
 * This is useful for testing and not recommended to use in production.
 * @since 1.0.0
 * @category layers
 */
export const json = /*#__PURE__*/Layer.succeed(Serialization, {
  [TypeId]: {},
  encode: (message, schema) => pipe(jsonStringify(message, schema), Effect.mapError(ShardError.EncodeError), Effect.map(ByteArray.make)),
  decode: (body, schema) => pipe(jsonParse(body.value, schema), Effect.mapError(ShardError.DecodeError))
});
//# sourceMappingURL=Serialization.mjs.map