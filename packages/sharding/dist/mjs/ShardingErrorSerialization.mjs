/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingErrorSerializationTag = "@effect/sharding/ShardingErrorSerialization";
const ShardingErrorSerializationSchema_ = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingErrorSerializationTag),
  error: Schema.string
}));
/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingErrorSerialization(error) {
  return Data.struct({
    _tag: ShardingErrorSerializationTag,
    error
  });
}
/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingErrorSerialization(value) {
  return value && "_tag" in value && value._tag === ShardingErrorSerializationTag;
}
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorSerializationSchema = ShardingErrorSerializationSchema_;
//# sourceMappingURL=ShardingErrorSerialization.mjs.map