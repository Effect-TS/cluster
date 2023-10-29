/**
 * @since 1.0.0
 */
import type * as PodAddress from "@effect/cluster/PodAddress"
import type * as ShardId from "@effect/cluster/ShardId"
import type * as HashSet from "effect/HashSet"

interface ShardsAssigned {
  readonly _tag: "ShardsAssigned"
  readonly pod: PodAddress.PodAddress
  readonly shards: HashSet.HashSet<ShardId.ShardId>
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
  readonly _tag: "ShardsUnassigned"
  readonly pod: PodAddress.PodAddress
  readonly shards: HashSet.HashSet<ShardId.ShardId>
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
  readonly _tag: "PodHealthChecked"
  readonly pod: PodAddress.PodAddress
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function PodHealthChecked(pod: PodAddress.PodAddress): PodHealthChecked {
  return { _tag: "PodHealthChecked", pod }
}

interface PodRegistered {
  readonly _tag: "PodRegistered"
  readonly pod: PodAddress.PodAddress
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function PodRegistered(pod: PodAddress.PodAddress): PodRegistered {
  return { _tag: "PodRegistered", pod }
}

interface PodUnregistered {
  readonly _tag: "PodUnregistered"
  readonly pod: PodAddress.PodAddress
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
