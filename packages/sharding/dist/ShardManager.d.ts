/**
 * @since 1.0.0
 */
import * as ManagerConfig from "@effect/sharding/ManagerConfig";
import type * as Pod from "@effect/sharding/Pod";
import * as PodAddress from "@effect/sharding/PodAddress";
import * as Pods from "@effect/sharding/Pods";
import * as PodsHealth from "@effect/sharding/PodsHealth";
import * as ShardId from "@effect/sharding/ShardId";
import * as ShardingEvent from "@effect/sharding/ShardingEvent";
import * as ShardManagerState from "@effect/sharding/ShardManagerState";
import * as Storage from "@effect/sharding/Storage";
import { Tag } from "effect/Context";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardManager {
    readonly getShardingEvents: Stream.Stream<never, never, ShardingEvent.ShardingEvent>;
    readonly register: (pod: Pod.Pod) => Effect.Effect<never, never, void>;
    readonly unregister: (podAddress: PodAddress.PodAddress) => Effect.Effect<never, never, void>;
    readonly notifyUnhealthyPod: (podAddress: PodAddress.PodAddress) => Effect.Effect<never, never, void>;
    readonly checkAllPodsHealth: Effect.Effect<never, never, void>;
    readonly getAssignments: Effect.Effect<never, never, HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>>;
}
/**
 * @since 1.0.0
 * @category context
 */
export declare const ShardManager: Tag<ShardManager, ShardManager>;
/**
 * @since 1.0.0
 */
export declare function decideAssignmentsForUnbalancedShards(state: ShardManagerState.ShardManagerState, rebalanceRate: number): readonly [assignments: HashMap.HashMap<PodAddress.PodAddress, HashSet.HashSet<ShardId.ShardId>>, unassignments: HashMap.HashMap<PodAddress.PodAddress, HashSet.HashSet<ShardId.ShardId>>];
/**
 * @since 1.0.0
 * @category layers
 */
export declare const live: Layer.Layer<Storage.Storage | Pods.Pods | PodsHealth.PodsHealth | ManagerConfig.ManagerConfig, never, ShardManager>;
//# sourceMappingURL=ShardManager.d.ts.map