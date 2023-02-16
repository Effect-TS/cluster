import * as HashMap from "@fp-ts/data/HashMap";
import * as HashSet from "@fp-ts/data/HashSet";
import * as List from "@fp-ts/data/List";
import * as PodAddress from "./PodAddress";
import * as ShardId from "./ShardId";
import * as Option from "@fp-ts/core/Option";
import * as PodWithMetadata from "./PodWithMetadata";
import { pipe } from "@fp-ts/core/Function";

export interface ShardManagerState {
  pods: HashMap.HashMap<PodAddress.PodAddress, PodWithMetadata.PodWithMetadata>;
  shards: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>;
  unassignedShards: HashSet.HashSet<ShardId.ShardId>;
  averageShardsPerPod: ShardId.ShardId;
  shardsPerPod: HashMap.HashMap<PodAddress.PodAddress, HashSet.HashSet<ShardId.ShardId>>;
  maxVersion: Option.Option<List.List<number>>;
}

export function apply(
  pods: HashMap.HashMap<PodAddress.PodAddress, PodWithMetadata.PodWithMetadata>,
  shards: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
): ShardManagerState {
  const podVersions = pipe(
    HashMap.values(pods),
    List.fromIterable,
    List.map(PodWithMetadata.extractVersion)
  );
  const maxVersion = pipe(
    podVersions,
    List.reduce(List.empty<number>(), (curr, a) =>
      PodWithMetadata.compareVersion(curr, a) === -1 ? a : curr
    ),
    (result) => (List.length(result) === 0 ? Option.none() : Option.some(result))
  );
  const shardsPerPodPods = pipe(
    HashMap.reduceWithIndex(
      shards,
      HashMap.empty<PodAddress.PodAddress, HashSet.HashSet<ShardId.ShardId>>(),
      (curr, optionPod, shardId) => {
        if (Option.isNone(optionPod)) return curr;
        if (HashMap.has(curr, optionPod.value)) {
          return HashMap.modify(curr, optionPod.value, HashSet.add(shardId));
        } else {
          return HashMap.set(curr, optionPod.value, HashSet.fromIterable([shardId]));
        }
      }
    )
  );
  const shardsPerPod = pipe(
    HashMap.map(pods, () => HashSet.empty<ShardId.ShardId>()),
    HashMap.union(shardsPerPodPods)
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
    shardsPerPod,
    maxVersion,
  };
}
