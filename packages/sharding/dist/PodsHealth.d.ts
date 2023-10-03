/**
 * @since 1.0.0
 */
import type { PodAddress } from "@effect/sharding/PodAddress";
import * as Pods from "@effect/sharding/Pods";
import { Tag } from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
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
    /**
     * @since 1.0.0
     */
    readonly _id: TypeId;
    /**
     * Check if a pod is still alive.
     * @since 1.0.0
     */
    readonly isAlive: (podAddress: PodAddress) => Effect.Effect<never, never, boolean>;
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