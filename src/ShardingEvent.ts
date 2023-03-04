import * as PodAddress from "./PodAddress";
import * as HashSet from "@effect/data/HashSet";
import * as ShardId from "./ShardId";

interface ShardsAssigned {
  _tag: "ShardsAssigned";
  pod: PodAddress.PodAddress;
  shards: HashSet.HashSet<ShardId.ShardId>;
}
interface ShardsUnassigned {
  _tag: "ShardsUnassigned";
  pod: PodAddress.PodAddress;
  shards: HashSet.HashSet<ShardId.ShardId>;
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

export type ShardingEvent = ShardsAssigned | ShardsUnassigned | PodHealthChecked | PodRegistered;
