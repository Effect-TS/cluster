/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingSerializationErrorTag = "@effect/shardcake/ShardingSerializationError";
const ShardingSerializationErrorSchema_ = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingSerializationErrorTag),
  error: Schema.string
}));
/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingSerializationError(error) {
  return Data.struct({
    _tag: ShardingSerializationErrorTag,
    error
  });
}
/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingSerializationError(value) {
  return value && "_tag" in value && value._tag === ShardingSerializationErrorTag;
}
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingSerializationErrorSchema = ShardingSerializationErrorSchema_;
//# sourceMappingURL=ShardingSerializationError.mjs.map