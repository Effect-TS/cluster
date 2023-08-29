/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/sharding/ShardId";
/**
 * @since 1.0.0
 * @category constructors
 */
export function make(value) {
  return Data.struct({
    _id: TypeId,
    value
  });
}
/** @internal */
export function show(value) {
  return "ShardId(" + value.value + ")";
}
/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _id: /*#__PURE__*/Schema.literal(TypeId),
  value: Schema.number
}));
//# sourceMappingURL=ShardId.mjs.map