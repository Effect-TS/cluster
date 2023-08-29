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
export const ShardingPodUnavailableErrorTag = "@effect/sharding/ShardingPodUnavailableError";
const ShardingPodUnavailableErrorSchema_ = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingPodUnavailableErrorTag),
  pod: PodAddress.schema
}));
/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingPodUnavailableError(pod) {
  return Data.struct({
    _tag: ShardingPodUnavailableErrorTag,
    pod
  });
}
/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingPodUnavailableError(value) {
  return value && value !== null && "_tag" in value && value._tag === ShardingPodUnavailableErrorTag;
}
/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingPodUnavailableErrorSchema = ShardingPodUnavailableErrorSchema_;
//# sourceMappingURL=ShardingPodUnavailableError.mjs.map