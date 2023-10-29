"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PodHealthChecked = PodHealthChecked;
exports.PodRegistered = PodRegistered;
exports.PodUnregistered = PodUnregistered;
exports.ShardsAssigned = ShardsAssigned;
exports.ShardsUnassigned = ShardsUnassigned;
/**
 * @since 1.0.0
 * @category constructors
 */
function ShardsAssigned(pod, shards) {
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
function ShardsUnassigned(pod, shards) {
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
function PodHealthChecked(pod) {
  return {
    _tag: "PodHealthChecked",
    pod
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
function PodRegistered(pod) {
  return {
    _tag: "PodRegistered",
    pod
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
function PodUnregistered(pod) {
  return {
    _tag: "PodUnregistered",
    pod
  };
}
//# sourceMappingURL=ShardingEvent.js.map