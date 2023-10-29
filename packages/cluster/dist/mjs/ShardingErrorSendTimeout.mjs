/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as Data from "effect/Data";
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorSendTimeoutTag = "@effect/cluster/ShardingErrorSendTimeout";
const ShardingErrorSendTimeoutSchema_ = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingErrorSendTimeoutTag)
}));
/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingErrorSendTimeout() {
  return Data.struct({
    _tag: ShardingErrorSendTimeoutTag
  });
}
/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingErrorSendTimeout(value) {
  return value && "_tag" in value && value._tag === ShardingErrorSendTimeoutTag;
}
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorSendTimeoutSchema = ShardingErrorSendTimeoutSchema_;
//# sourceMappingURL=ShardingErrorSendTimeout.mjs.map