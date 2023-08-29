/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
import * as PodAddress from "@effect/sharding/PodAddress";
/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingErrorEntityTypeNotRegisteredTag = "@effect/sharding/ShardingErrorEntityTypeNotRegistered";
const ShardingErrorEntityTypeNotRegisteredSchema_ = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingErrorEntityTypeNotRegisteredTag),
  entityType: Schema.string,
  podAddress: PodAddress.schema
}));
/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingErrorEntityTypeNotRegistered(entityType, podAddress) {
  return Data.struct({
    _tag: ShardingErrorEntityTypeNotRegisteredTag,
    entityType,
    podAddress
  });
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function isShardingErrorEntityTypeNotRegistered(value) {
  return typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === ShardingErrorEntityTypeNotRegisteredTag;
}
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorEntityTypeNotRegisteredSchema = ShardingErrorEntityTypeNotRegisteredSchema_;
//# sourceMappingURL=ShardingErrorEntityTypeNotRegistered.mjs.map