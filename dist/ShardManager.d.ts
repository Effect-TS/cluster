import { Tag } from "@effect/data/Context";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as ManagerConfig from "@effect/shardcake/ManagerConfig";
import type * as Pod from "@effect/shardcake/Pod";
import * as PodAddress from "@effect/shardcake/PodAddress";
import * as Pods from "@effect/shardcake/Pods";
import * as PodsHealth from "@effect/shardcake/PodsHealth";
import * as ShardingEvent from "@effect/shardcake/ShardingEvent";
import * as Storage from "@effect/shardcake/Storage";
import * as Stream from "@effect/stream/Stream";
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardManager {
    getShardingEvents: Stream.Stream<never, never, ShardingEvent.ShardingEvent>;
    register(pod: Pod.Pod): Effect.Effect<never, never, void>;
    unregister(podAddress: PodAddress.PodAddress): Effect.Effect<never, never, void>;
    notifyUnhealthyPod: (podAddress: PodAddress.PodAddress) => Effect.Effect<never, never, void>;
    checkAllPodsHealth: Effect.Effect<never, never, void>;
}
/**
 * @since 1.0.0
 * @category context
 */
export declare const ShardManager: Tag<ShardManager, ShardManager>;
/**
 * @since 1.0.0
 * @category layers
 */
export declare const live: Layer.Layer<Storage.Storage | Pods.Pods | PodsHealth.PodsHealth | ManagerConfig.ManagerConfig, never, ShardManager>;
//# sourceMappingURL=ShardManager.d.ts.map