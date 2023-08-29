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
export const ShardingErrorPodUnavailableTag = "@effect/sharding/ShardingErrorPodUnavailable";
const ShardingErrorPodUnavailableSchema_ = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingErrorPodUnavailableTag),
  pod: PodAddress.schema
}));
/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingErrorPodUnavailable(pod) {
  return Data.struct({
    _tag: ShardingErrorPodUnavailableTag,
    pod
  });
}
/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingErrorPodUnavailable(value) {
  return value && value !== null && "_tag" in value && value._tag === ShardingErrorPodUnavailableTag;
}
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorPodUnavailableSchema = ShardingErrorPodUnavailableSchema_;
//# sourceMappingURL=ShardingErrorPodUnavailable.mjs.map