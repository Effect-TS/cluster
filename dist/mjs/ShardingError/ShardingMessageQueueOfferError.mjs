/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingMessageQueueOfferErrorTag = "@effect/shardcake/ShardingMessageQueueOfferError";
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingMessageQueueOfferErrorSchema = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingMessageQueueOfferErrorTag),
  error: Schema.string
}));
/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingMessageQueueOfferError(error) {
  return Data.struct({
    _tag: ShardingMessageQueueOfferErrorTag,
    error
  });
}
/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingMessageQueueOfferError(value) {
  return typeof value === "object" && value !== null && "_tag" in value && value._tag === ShardingMessageQueueOfferErrorTag;
}
//# sourceMappingURL=ShardingMessageQueueOfferError.mjs.map