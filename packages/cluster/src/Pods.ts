/**
 * @since 1.0.0
 */
import { Tag } from "effect/Context"
import * as Effect from "effect/Effect"
import type * as HashSet from "effect/HashSet"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import type * as PodAddress from "./PodAddress.js"
import type * as SerializedEnvelope from "./SerializedEnvelope.js"
import type * as SerializedMessage from "./SerializedMessage.js"
import type * as ShardId from "./ShardId.js"
import type * as ShardingError from "./ShardingError.js"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId: unique symbol = Symbol.for("@effect/cluster/Pods")

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * An interface to communicate with remote pods.
 * This is used by the Shard Manager for assigning and unassigning shards.
 * This is also used by pods for internal communication (forward messages to each other).
 *
 * @since 1.0.0
 * @category models
 */
export interface Pods {
  /**
   * @since 1.0.0
   */
  readonly _id: TypeId

  /**
   * Notify a pod that it was assigned a list of shards
   * @since 1.0.0
   */
  readonly assignShards: (
    pod: PodAddress.PodAddress,
    shards: HashSet.HashSet<ShardId.ShardId>
  ) => Effect.Effect<never, never, void>

  /**
   * Notify a pod that it was unassigned a list of shards
   * @since 1.0.0
   */
  readonly unassignShards: (
    pod: PodAddress.PodAddress,
    shards: HashSet.HashSet<ShardId.ShardId>
  ) => Effect.Effect<never, never, void>

  /**
   * Check that a pod is responsive
   * @since 1.0.0
   */
  readonly ping: (pod: PodAddress.PodAddress) => Effect.Effect<never, ShardingError.ShardingErrorPodUnavailable, void>

  /**
   * Send a message to a pod and receive a reply
   * @since 1.0.0
   */
  readonly sendMessage: (
    pod: PodAddress.PodAddress,
    envelope: SerializedEnvelope.SerializedEnvelope
  ) => Effect.Effect<
    never,
    ShardingError.ShardingError,
    Option.Option<SerializedMessage.SerializedMessage>
  >
}

/**
 * @since 1.0.0
 * @category context
 */
export const Pods = Tag<Pods>()

/**
 * A layer that creates a service that does nothing when called.
 * Useful for testing ShardManager or when using Sharding.local.
 *
 * @since 1.0.0
 * @category layers
 */
export const noop = Layer.succeed(Pods, {
  _id: TypeId,
  assignShards: () => Effect.unit,
  unassignShards: () => Effect.unit,
  ping: () => Effect.unit,
  sendMessage: () => Effect.succeed(Option.none())
})
