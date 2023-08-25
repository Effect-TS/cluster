/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingReplyErrorTag = "@effect/shardcake/ShardingReplyError";
/**
 * @since 1.0.0
 * @category models
 */
export const ShardingReplyErrorSchema = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingReplyErrorTag),
  error: Schema.string
}));
/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingReplyError(error) {
  return Data.struct({
    _tag: ShardingReplyErrorTag,
    error
  });
}
/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingReplyError(value) {
  return value && "_tag" in value && value._tag === ShardingReplyErrorTag;
}
//# sourceMappingURL=ShardingReplyError.mjs.map