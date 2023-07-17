/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardsAssigned(pod, shards) {
  return {
    _tag: "ShardsAssigned",
    pod,
    shards
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardsUnassigned(pod, shards) {
  return {
    _tag: "ShardsUnassigned",
    pod,
    shards
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function PodHealthChecked(pod) {
  return {
    _tag: "PodHealthChecked",
    pod
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function PodRegistered(pod) {
  return {
    _tag: "PodRegistered",
    pod
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function PodUnregistered(pod) {
  return {
    _tag: "PodUnregistered",
    pod
  };
}
//# sourceMappingURL=ShardingEvent.mjs.map