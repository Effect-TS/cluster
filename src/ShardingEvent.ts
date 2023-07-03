/**
 * @since 1.0.0
 */
import type * as HashSet from "@effect/data/HashSet"
import type * as PodAddress from "@effect/shardcake/PodAddress"
import type * as ShardId from "@effect/shardcake/ShardId"

interface ShardsAssigned {
  _tag: "ShardsAssigned"
  pod: PodAddress.PodAddress
  shards: HashSet.HashSet<ShardId.ShardId>
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardsAssigned(
  pod: PodAddress.PodAddress,
  shards: HashSet.HashSet<ShardId.ShardId>
): ShardsAssigned {
  return { _tag: "ShardsAssigned", pod, shards }
}

interface ShardsUnassigned {
  _tag: "ShardsUnassigned"
  pod: PodAddress.PodAddress
  shards: HashSet.HashSet<ShardId.ShardId>
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardsUnassigned(
  pod: PodAddress.PodAddress,
  shards: HashSet.HashSet<ShardId.ShardId>
): ShardsUnassigned {
  return { _tag: "ShardsUnassigned", pod, shards }
}

interface PodHealthChecked {
  _tag: "PodHealthChecked"
  pod: PodAddress.PodAddress
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function PodHealthChecked(pod: PodAddress.PodAddress): PodHealthChecked {
  return { _tag: "PodHealthChecked", pod }
}

interface PodRegistered {
  _tag: "PodRegistered"
  pod: PodAddress.PodAddress
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function PodRegistered(pod: PodAddress.PodAddress): PodRegistered {
  return { _tag: "PodRegistered", pod }
}

interface PodUnregistered {
  _tag: "PodUnregistered"
  pod: PodAddress.PodAddress
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function PodUnregistered(pod: PodAddress.PodAddress): PodUnregistered {
  return { _tag: "PodUnregistered", pod }
}

/**
 * @since 1.0.0
 * @category models
 */
export type ShardingEvent =
  | ShardsAssigned
  | ShardsUnassigned
  | PodHealthChecked
  | PodRegistered
  | PodUnregistered
