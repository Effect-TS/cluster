import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import { Tag } from "@fp-ts/data/Context";
import { pipe } from "@fp-ts/core/Function";
import * as Option from "@fp-ts/core/Option";
import { PodAddress } from "./PodAddress";
import { Pods } from "./Pods";

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = Symbol.for("@effect/shardcake/PodsHealth");

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
 */
export interface PodsHealth {
  [TypeId]: {};

  /**
   * Check if a pod is still alive.
   */
  isAlive(podAddress: PodAddress): Effect.Effect<never, never, boolean>;
}

export const PodsHealth = Tag<PodsHealth>();

/**
 * A layer that considers pods as always alive.
 * This is useful for testing only.
 */
export const noop = Layer.succeed(PodsHealth, {
  [TypeId]: {},
  isAlive: () => Effect.succeed(true),
});

/**
 * A layer that pings the pod directly to check if it's alive.
 * This is useful for developing and testing but not reliable in production.
 */
export const local = Layer.effect(
  PodsHealth,
  Effect.serviceWith(Pods, (podApi) => ({
    [TypeId]: {},
    isAlive: (address: PodAddress) =>
      pipe(podApi.ping(address), Effect.option, Effect.map(Option.isSome)),
  }))
);
