/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
import * as PodAddress from "@effect/shardcake/PodAddress";
/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingPodNoLongerRegisteredErrorTag = "@effect/shardcake/ShardingPodNoLongerRegisteredError";
const ShardingPodNoLongerRegisteredErrorSchema_ = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingPodNoLongerRegisteredErrorTag),
  podAddress: PodAddress.schema
}));
/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingPodNoLongerRegisteredError(podAddress) {
  return Data.struct({
    _tag: ShardingPodNoLongerRegisteredErrorTag,
    podAddress
  });
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function isShardingPodNoLongerRegisteredError(value) {
  return typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === ShardingPodNoLongerRegisteredErrorTag;
}
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingPodNoLongerRegisteredErrorSchema = ShardingPodNoLongerRegisteredErrorSchema_;
//# sourceMappingURL=ShardingPodNoLongerRegisteredError.mjs.map