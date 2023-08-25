import { Tag } from "@effect/data/Context";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as ManagerConfig from "@effect/sharding/ManagerConfig";
import type * as Pod from "@effect/sharding/Pod";
import * as PodAddress from "@effect/sharding/PodAddress";
import * as Pods from "@effect/sharding/Pods";
import * as PodsHealth from "@effect/sharding/PodsHealth";
import * as ShardingEvent from "@effect/sharding/ShardingEvent";
import * as Storage from "@effect/sharding/Storage";
import * as Stream from "@effect/stream/Stream";
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
export declare const live: Layer.Layer<Pods.Pods | Storage.Storage | PodsHealth.PodsHealth | ManagerConfig.ManagerConfig, never, ShardManager>;
//# sourceMappingURL=ShardManager.d.ts.map