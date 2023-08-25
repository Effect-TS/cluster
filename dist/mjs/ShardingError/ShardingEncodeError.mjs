/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingEncodeErrorTag = "@effect/shardcake/ShardingEncodeError";
const ShardingEncodeErrorSchema_ = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingEncodeErrorTag),
  error: Schema.string
}));
/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingEncodeError(error) {
  return Data.struct({
    _tag: ShardingEncodeErrorTag,
    error
  });
}
/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingEncodeError(value) {
  return value && "_tag" in value && value._tag === ShardingEncodeErrorTag;
}
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingEncodeErrorSchema = ShardingEncodeErrorSchema_;
//# sourceMappingURL=ShardingEncodeError.mjs.map