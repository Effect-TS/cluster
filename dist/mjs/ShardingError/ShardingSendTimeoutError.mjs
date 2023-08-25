/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingSendTimeoutErrorTag = "@effect/shardcake/ShardingSendTimeoutError";
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingSendTimeoutErrorSchema = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingSendTimeoutErrorTag)
}));
/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingSendTimeoutError() {
  return Data.struct({
    _tag: ShardingSendTimeoutErrorTag
  });
}
/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingSendTimeoutError(value) {
  return value && "_tag" in value && value._tag === ShardingSendTimeoutErrorTag;
}
//# sourceMappingURL=ShardingSendTimeoutError.mjs.map