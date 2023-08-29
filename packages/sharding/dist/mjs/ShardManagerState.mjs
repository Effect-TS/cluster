/**
 * @since 1.0.0
 */
import { equals } from "@effect/data/Equal";
import * as HashMap from "@effect/data/HashMap";
import * as HashSet from "@effect/data/HashSet";
import * as List from "@effect/data/List";
import * as Option from "@effect/data/Option";
import * as PodWithMetadata from "@effect/sharding/PodWithMetadata";
import * as ShardId from "@effect/sharding/ShardId";
/**
 * @since 1.0.0
 * @category constructors
 */
export function make(pods, shards) {
  const podVersions = List.map(PodWithMetadata.extractVersion)(List.fromIterable(HashMap.values(pods)));
  const maxVersion = (result => List.size(result) === 0 ? Option.none() : Option.some(result))(List.reduce(List.empty(), (curr, a) => PodWithMetadata.compareVersion(curr, a) === -1 ? a : curr)(podVersions));
  const shardsPerPodPods = HashMap.reduce(shards, HashMap.empty(), (curr, optionPod, shardId) => {
    if (Option.isNone(optionPod)) return curr;
    if (HashMap.has(curr, optionPod.value)) {
      return HashMap.modify(curr, optionPod.value, HashSet.add(shardId));
    } else {
      return HashMap.set(curr, optionPod.value, HashSet.fromIterable([shardId]));
    }
  });
  const shardsPerPod = HashMap.union(shardsPerPodPods)(HashMap.map(pods, () => HashSet.empty()));
  const allPodsHaveMaxVersion = List.every(podVersions, _ => equals(Option.some(_))(maxVersion));
  return {
    pods,
    shards,
    unassignedShards: HashSet.map(([k, _]) => k)(HashSet.fromIterable(HashMap.filter(shards, (a, _) => Option.isNone(a)))),
    averageShardsPerPod: HashMap.isEmpty(pods) ? ShardId.make(0) : ShardId.make(HashMap.size(shards) / HashMap.size(pods)),
    shardsPerPod,
    maxVersion,
    allPodsHaveMaxVersion
  };
}
//# sourceMappingURL=ShardManagerState.mjs.map