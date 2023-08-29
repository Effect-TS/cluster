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
export const ShardingErrorPodNoLongerRegisteredTag = "@effect/sharding/ShardingErrorPodNoLongerRegistered";
const ShardingErrorPodNoLongerRegisteredSchema_ = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingErrorPodNoLongerRegisteredTag),
  podAddress: PodAddress.schema
}));
/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingErrorPodNoLongerRegistered(podAddress) {
  return Data.struct({
    _tag: ShardingErrorPodNoLongerRegisteredTag,
    podAddress
  });
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function isShardingErrorPodNoLongerRegistered(value) {
  return typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === ShardingErrorPodNoLongerRegisteredTag;
}
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorPodNoLongerRegisteredSchema = ShardingErrorPodNoLongerRegisteredSchema_;
//# sourceMappingURL=ShardingErrorPodNoLongerRegistered.mjs.map