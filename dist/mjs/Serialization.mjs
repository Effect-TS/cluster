/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context";
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
  _id: TypeId,
  encode: (message, schema) => Effect.map(ByteArray.make)(Effect.mapError(ShardError.EncodeError)(jsonStringify(message, schema))),
  decode: (body, schema) => Effect.mapError(ShardError.DecodeError)(jsonParse(body.value, schema))
});
//# sourceMappingURL=Serialization.mjs.map