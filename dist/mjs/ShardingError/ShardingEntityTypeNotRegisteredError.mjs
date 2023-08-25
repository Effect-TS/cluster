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
export const ShardingEntityTypeNotRegisteredErrorTag = "@effect/sharding/ShardingEntityTypeNotRegisteredError";
const ShardingEntityTypeNotRegisteredErrorSchema_ = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingEntityTypeNotRegisteredErrorTag),
  entityType: Schema.string,
  podAddress: PodAddress.schema
}));
/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingEntityTypeNotRegisteredError(entityType, podAddress) {
  return Data.struct({
    _tag: ShardingEntityTypeNotRegisteredErrorTag,
    entityType,
    podAddress
  });
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function isShardingEntityTypeNotRegisteredError(value) {
  return typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === ShardingEntityTypeNotRegisteredErrorTag;
}
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingEntityTypeNotRegisteredErrorSchema = ShardingEntityTypeNotRegisteredErrorSchema_;
//# sourceMappingURL=ShardingEntityTypeNotRegisteredError.mjs.map