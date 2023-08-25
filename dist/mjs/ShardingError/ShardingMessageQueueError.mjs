/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingMessageQueueErrorTag = "@effect/shardcake/ShardingMessageQueueError";
const ShardingMessageQueueErrorSchema_ = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingMessageQueueErrorTag),
  error: Schema.string
}));
/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingMessageQueueError(error) {
  return Data.struct({
    _tag: ShardingMessageQueueErrorTag,
    error
  });
}
/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingMessageQueueError(value) {
  return typeof value === "object" && value !== null && "_tag" in value && value._tag === ShardingMessageQueueErrorTag;
}
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingMessageQueueErrorSchema = ShardingMessageQueueErrorSchema_;
//# sourceMappingURL=ShardingMessageQueueError.mjs.map