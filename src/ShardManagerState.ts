import * as HashMap from "@fp-ts/data/HashMap";
import * as HashSet from "@fp-ts/data/HashSet";
import * as PodAddress from "./PodAddress";
import * as ShardId from "./ShardId";
import * as Option from "@fp-ts/core/Option";
import * as PodWithMetadata from "./PodWithMetadata";
import { pipe } from "@fp-ts/core/Function";
import { equals } from "@fp-ts/data/Equal";

export interface ShardManagerState {
  pods: HashMap.HashMap<PodAddress.PodAddress, PodWithMetadata.PodWithMetadata>;
  shards: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>;
  unassignedShards: HashSet.HashSet<ShardId.ShardId>;
  averageShardsPerPod: ShardId.ShardId;
}

export function apply(
  pods: HashMap.HashMap<PodAddress.PodAddress, PodWithMetadata.PodWithMetadata>,
  shards: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
): ShardManagerState {
  const podVersions = pipe(
    HashMap.values(pods),
    HashSet.fromIterable,
    HashSet.map(PodWithMetadata.extractVersion)
  );
  return {
    pods,
    shards,
    unassignedShards: pipe(
      HashMap.filterWithIndex(shards, (a, k) => Option.isNone(a)),
      HashSet.fromIterable,
      HashSet.map(([k, _]) => k)
    ),
    averageShardsPerPod: pipe(
      HashMap.isEmpty(pods)
        ? ShardId.apply(0)
        : ShardId.apply(HashMap.size(shards) / HashMap.size(pods))
    ),
  };
}
