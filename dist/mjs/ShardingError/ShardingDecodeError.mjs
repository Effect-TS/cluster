/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingDecodeErrorTag = "@effect/shardcake/ShardingDecodeError";
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingDecodeErrorSchema = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingDecodeErrorTag),
  error: Schema.string
}));
/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingDecodeError(error) {
  return Data.struct({
    _tag: ShardingDecodeErrorTag,
    error
  });
}
/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingDecodeError(value) {
  return value && "_tag" in value && value._tag === ShardingDecodeErrorTag;
}
//# sourceMappingURL=ShardingDecodeError.mjs.map