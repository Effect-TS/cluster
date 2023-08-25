/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/sharding/ByteArray";
/**
 * Construct a new `ByteArray` from its internal string value.
 *
 * @since 1.0.0
 * @category constructors
 */
export function make(value) {
  return Data.struct({
    _id: TypeId,
    value
  });
}
/**
 * @since 1.0.0
 * @category utils
 */
export function isByteArray(value) {
  return typeof value === "object" && value !== null && "_id" in value && value["_id"] === TypeId;
}
/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _id: /*#__PURE__*/Schema.literal(TypeId),
  value: Schema.string
}));
/**
 * This is the schema for a value starting from a string.
 *
 * @since 1.0.0
 * @category schema
 */
export const schemaFromString = /*#__PURE__*/Schema.transform(Schema.string, schema, make, byteArray => byteArray.value);
//# sourceMappingURL=ByteArray.mjs.map