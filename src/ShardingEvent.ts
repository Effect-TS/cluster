import * as PodAddress from "./PodAddress";
import * as HashSet from "@effect/data/HashSet";
import * as ShardId from "./ShardId";

interface ShardsAssigned {
  _tag: "ShardsAssigned";
  pod: PodAddress.PodAddress;
  shards: HashSet.HashSet<ShardId.ShardId>;
}
export function ShardsAssigned(
  pod: PodAddress.PodAddress,
  shards: HashSet.HashSet<ShardId.ShardId>
): ShardsAssigned {
  return { _tag: "ShardsAssigned", pod, shards };
}

interface ShardsUnassigned {
  _tag: "ShardsUnassigned";
  pod: PodAddress.PodAddress;
  shards: HashSet.HashSet<ShardId.ShardId>;
}
export function ShardsUnassigned(
  pod: PodAddress.PodAddress,
  shards: HashSet.HashSet<ShardId.ShardId>
): ShardsUnassigned {
  return { _tag: "ShardsUnassigned", pod, shards };
}

interface PodHealthChecked {
  _tag: "PodHealthChecked";
  pod: PodAddress.PodAddress;
}
export function PodHealthChecked(pod: PodAddress.PodAddress): PodHealthChecked {
  return { _tag: "PodHealthChecked", pod };
}

interface PodRegistered {
  _tag: "PodRegistered";
  pod: PodAddress.PodAddress;
}
export function PodRegistered(pod: PodAddress.PodAddress): PodRegistered {
  return { _tag: "PodRegistered", pod };
}

interface PodUnregistered {
  _tag: "PodUnregistered";
  pod: PodAddress.PodAddress;
}
export function PodUnregistered(pod: PodAddress.PodAddress): PodUnregistered {
  return { _tag: "PodUnregistered", pod };
}

export type ShardingEvent =
  | ShardsAssigned
  | ShardsUnassigned
  | PodHealthChecked
  | PodRegistered
  | PodUnregistered;
