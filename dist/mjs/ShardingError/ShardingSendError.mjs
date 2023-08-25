/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingSendErrorTag = "@effect/shardcake/ShardingSendError";
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingSendErrorSchema = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingSendErrorTag),
  error: Schema.string
}));
/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingSendError(error) {
  return Data.struct({
    _tag: ShardingSendErrorTag,
    error
  });
}
/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingSendError(value) {
  return value && "_tag" in value && value._tag === ShardingSendErrorTag;
}
//# sourceMappingURL=ShardingSendError.mjs.map