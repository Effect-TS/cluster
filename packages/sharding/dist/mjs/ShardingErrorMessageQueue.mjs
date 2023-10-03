/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as Data from "effect/Data";
/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingErrorMessageQueueTag = "@effect/sharding/ShardingErrorMessageQueue";
const ShardingErrorMessageQueueSchema_ = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingErrorMessageQueueTag),
  error: Schema.string
}));
/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingErrorMessageQueue(error) {
  return Data.struct({
    _tag: ShardingErrorMessageQueueTag,
    error
  });
}
/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingErrorMessageQueue(value) {
  return typeof value === "object" && value !== null && "_tag" in value && value._tag === ShardingErrorMessageQueueTag;
}
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorMessageQueueSchema = ShardingErrorMessageQueueSchema_;
//# sourceMappingURL=ShardingErrorMessageQueue.mjs.map