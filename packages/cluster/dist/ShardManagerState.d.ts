/**
 * @since 1.0.0
 */
import type * as PodAddress from "@effect/cluster/PodAddress";
import * as PodWithMetadata from "@effect/cluster/PodWithMetadata";
import * as ShardId from "@effect/cluster/ShardId";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as List from "effect/List";
import * as Option from "effect/Option";
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardManagerState {
    readonly pods: HashMap.HashMap<PodAddress.PodAddress, PodWithMetadata.PodWithMetadata>;
    readonly shards: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>;
    readonly unassignedShards: HashSet.HashSet<ShardId.ShardId>;
    readonly averageShardsPerPod: ShardId.ShardId;
    readonly shardsPerPod: HashMap.HashMap<PodAddress.PodAddress, HashSet.HashSet<ShardId.ShardId>>;
    readonly maxVersion: Option.Option<List.List<number>>;
    readonly allPodsHaveMaxVersion: boolean;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function make(pods: HashMap.HashMap<PodAddress.PodAddress, PodWithMetadata.PodWithMetadata>, shards: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>): ShardManagerState;
//# sourceMappingURL=ShardManagerState.d.ts.map