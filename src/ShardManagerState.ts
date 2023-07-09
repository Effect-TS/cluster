/**
 * @since 1.0.0
 */
import { equals } from "@effect/data/Equal"
import { pipe } from "@effect/data/Function"
import * as HashMap from "@effect/data/HashMap"
import * as HashSet from "@effect/data/HashSet"
import * as List from "@effect/data/List"
import * as Option from "@effect/data/Option"
import type * as PodAddress from "@effect/shardcake/PodAddress"
import * as PodWithMetadata from "@effect/shardcake/PodWithMetadata"
import * as ShardId from "@effect/shardcake/ShardId"

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardManagerState {
  pods: HashMap.HashMap<PodAddress.PodAddress, PodWithMetadata.PodWithMetadata>
  shards: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
  unassignedShards: HashSet.HashSet<ShardId.ShardId>
  averageShardsPerPod: ShardId.ShardId
  shardsPerPod: HashMap.HashMap<PodAddress.PodAddress, HashSet.HashSet<ShardId.ShardId>>
  maxVersion: Option.Option<List.List<number>>
  allPodsHaveMaxVersion: boolean
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function make(
  pods: HashMap.HashMap<PodAddress.PodAddress, PodWithMetadata.PodWithMetadata>,
  shards: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
): ShardManagerState {
  const podVersions = pipe(
    HashMap.values(pods),
    List.fromIterable,
    List.map(PodWithMetadata.extractVersion)
  )
  const maxVersion = pipe(
    podVersions,
    List.reduce(List.empty<number>(), (curr, a) => PodWithMetadata.compareVersion(curr, a) === -1 ? a : curr),
    (result) => (List.size(result) === 0 ? Option.none() : Option.some(result))
  )
  const shardsPerPodPods = pipe(
    HashMap.reduceWithIndex(
      shards,
      HashMap.empty<PodAddress.PodAddress, HashSet.HashSet<ShardId.ShardId>>(),
      (curr, optionPod, shardId) => {
        if (Option.isNone(optionPod)) return curr
        if (HashMap.has(curr, optionPod.value)) {
          return HashMap.modify(curr, optionPod.value, HashSet.add(shardId))
        } else {
          return HashMap.set(curr, optionPod.value, HashSet.fromIterable([shardId]))
        }
      }
    )
  )
  const shardsPerPod = pipe(
    HashMap.map(pods, () => HashSet.empty<ShardId.ShardId>()),
    HashMap.union(shardsPerPodPods)
  )

  const allPodsHaveMaxVersion = List.every(podVersions, (_) => equals(Option.some(_))(maxVersion))
  return {
    pods,
    shards,
    unassignedShards: pipe(
      HashMap.filterWithIndex(shards, (a, _) => Option.isNone(a)),
      HashSet.fromIterable,
      HashSet.map(([k, _]) => k)
    ),
    averageShardsPerPod: pipe(
      HashMap.isEmpty(pods)
        ? ShardId.make(0)
        : ShardId.make(HashMap.size(shards) / HashMap.size(pods))
    ),
    shardsPerPod,
    maxVersion,
    allPodsHaveMaxVersion
  }
}
