/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as Schema from "@effect/schema/Schema";
import * as TreeFormatter from "@effect/schema/TreeFormatter";
import * as ByteArray from "@effect/sharding/ByteArray";
import * as ShardingError from "@effect/sharding/ShardingError";
/** @internal */
function jsonStringify(value, schema) {
  return Effect.map(_ => JSON.stringify(_))(Effect.mapError(e => ShardingError.ShardingErrorSerialization(TreeFormatter.formatErrors(e.errors)))(Schema.encode(schema)(value)));
}
/** @internal */
function jsonParse(value, schema) {
  return Effect.mapError(e => ShardingError.ShardingErrorSerialization(TreeFormatter.formatErrors(e.errors)))(Effect.flatMap(Schema.decode(schema))(Effect.sync(() => JSON.parse(value))));
}
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = /*#__PURE__*/Symbol.for("@effect/sharding/SerializationTypeId");
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
  encode: (message, schema) => Effect.map(ByteArray.make)(jsonStringify(message, schema)),
  decode: (body, schema) => jsonParse(body.value, schema)
});
//# sourceMappingURL=Serialization.mjs.map