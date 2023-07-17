import * as HashMap from "@effect/data/HashMap";
import * as HashSet from "@effect/data/HashSet";
import * as List from "@effect/data/List";
import * as Option from "@effect/data/Option";
import type * as PodAddress from "@effect/shardcake/PodAddress";
import * as PodWithMetadata from "@effect/shardcake/PodWithMetadata";
import * as ShardId from "@effect/shardcake/ShardId";
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardManagerState {
    pods: HashMap.HashMap<PodAddress.PodAddress, PodWithMetadata.PodWithMetadata>;
    shards: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>;
    unassignedShards: HashSet.HashSet<ShardId.ShardId>;
    averageShardsPerPod: ShardId.ShardId;
    shardsPerPod: HashMap.HashMap<PodAddress.PodAddress, HashSet.HashSet<ShardId.ShardId>>;
    maxVersion: Option.Option<List.List<number>>;
    allPodsHaveMaxVersion: boolean;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function make(pods: HashMap.HashMap<PodAddress.PodAddress, PodWithMetadata.PodWithMetadata>, shards: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>): ShardManagerState;
//# sourceMappingURL=ShardManagerState.d.ts.map