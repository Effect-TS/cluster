import * as PodAddress from "./PodAddress";
import * as HashSet from "@fp-ts/data/HashSet";
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

export type ShardingEvent = ShardsAssigned | ShardsUnassigned;
