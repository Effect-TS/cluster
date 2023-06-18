import { Tag } from "@effect/data/Context"
import type * as HashSet from "@effect/data/HashSet"
import * as Option from "@effect/data/Option"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import type * as BinaryMessage from "@effect/shardcake/BinaryMessage"
import type * as ByteArray from "@effect/shardcake/ByteArray"
import type * as PodAddress from "@effect/shardcake/PodAddress"
import type { PodUnavailable } from "@effect/shardcake/ShardError"
import type * as ShardId from "@effect/shardcake/ShardId"

/**
 * @since 1.0.0
 * @category symbols
 */
export const PodsTypeId: unique symbol = Symbol.for("@effect/shardcake/Pods")

/**
 * @since 1.0.0
 * @category symbols
 */
export type PodsTypeId = typeof PodsTypeId

/**
 * An interface to communicate with remote pods.
 * This is used by the Shard Manager for assigning and unassigning shards.
 * This is also used by pods for internal communication (forward messages to each other).
 */
export interface Pods {
  [PodsTypeId]: {}
  /**
   * Notify a pod that it was assigned a list of shards
   */
  assignShards(
    pod: PodAddress.PodAddress,
    shards: HashSet.HashSet<ShardId.ShardId>
  ): Effect.Effect<never, never, void>

  /**
   * Notify a pod that it was unassigned a list of shards
   */
  unassignShards(
    pod: PodAddress.PodAddress,
    shards: HashSet.HashSet<ShardId.ShardId>
  ): Effect.Effect<never, never, void>

  /**
   * Check that a pod is responsive
   */
  ping(pod: PodAddress.PodAddress): Effect.Effect<never, PodUnavailable, void>

  /**
   * Send a message to a pod
   */
  sendMessage(
    pod: PodAddress.PodAddress,
    message: BinaryMessage.BinaryMessage
  ): Effect.Effect<never, never, Option.Option<ByteArray.ByteArray>>
}

export const Pods = Tag<Pods>()

/**
 * A layer that creates a service that does nothing when called.
 * Useful for testing ShardManager or when using Sharding.local.
 */
export const noop = Layer.succeed(Pods, {
  [PodsTypeId]: {},
  assignShards: () => Effect.unit(),
  unassignShards: () => Effect.unit(),
  ping: () => Effect.unit(),
  sendMessage: () => Effect.succeed(Option.none())
})
