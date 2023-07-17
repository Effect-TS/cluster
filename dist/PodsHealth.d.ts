/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import type { PodAddress } from "@effect/shardcake/PodAddress";
import * as Pods from "@effect/shardcake/Pods";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId: unique symbol;
/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;
/**
 * An interface to check a pod's health.
 * This is used when a pod is unresponsive, to check if it should be unassigned all its shards or not.
 * If the pod is alive, shards will not be unassigned because the pods might still be processing messages and might be responsive again.
 * If the pod is not alive, shards can be safely reassigned somewhere else.
 * A typical implementation for this is using k8s to check if the pod still exists.
 * @since 1.0.0
 * @category models
 */
export interface PodsHealth {
    [TypeId]: {};
    /**
     * Check if a pod is still alive.
     * @since 1.0.0
     */
    isAlive(podAddress: PodAddress): Effect.Effect<never, never, boolean>;
}
/**
 * @since 1.0.0
 * @category context
 */
export declare const PodsHealth: Tag<PodsHealth, PodsHealth>;
/**
 * A layer that considers pods as always alive.
 * This is useful for testing only.
 * @since 1.0.0
 * @category layers
 */
export declare const noop: Layer.Layer<never, never, PodsHealth>;
/**
 * A layer that pings the pod directly to check if it's alive.
 * This is useful for developing and testing but not reliable in production.
 * @since 1.0.0
 * @category layers
 */
export declare const local: Layer.Layer<Pods.Pods, never, PodsHealth>;
//# sourceMappingURL=PodsHealth.d.ts.map