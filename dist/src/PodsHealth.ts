/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context"
import { pipe } from "@effect/data/Function"
import * as Option from "@effect/data/Option"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import type { PodAddress } from "@effect/shardcake/PodAddress"
import * as Pods from "@effect/shardcake/Pods"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = Symbol.for("@effect/shardcake/PodsHealth")

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

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
  readonly _id: TypeId

  /**
   * Check if a pod is still alive.
   * @since 1.0.0
   */
  readonly isAlive: (podAddress: PodAddress) => Effect.Effect<never, never, boolean>
}

/**
 * @since 1.0.0
 * @category context
 */
export const PodsHealth = Tag<PodsHealth>()

/**
 * A layer that considers pods as always alive.
 * This is useful for testing only.
 * @since 1.0.0
 * @category layers
 */
export const noop = Layer.succeed(PodsHealth, {
  _id: TypeId,
  isAlive: () => Effect.succeed(true)
})

/**
 * A layer that pings the pod directly to check if it's alive.
 * This is useful for developing and testing but not reliable in production.
 * @since 1.0.0
 * @category layers
 */
export const local = Layer.effect(
  PodsHealth,
  Effect.map(Pods.Pods, (podApi) =>
    ({
      _id: TypeId,
      isAlive: (address: PodAddress) => pipe(podApi.ping(address), Effect.option, Effect.map(Option.isSome))
    }) as PodsHealth)
)
