/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context"
import type * as HashSet from "@effect/data/HashSet"
import * as Option from "@effect/data/Option"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import type * as BinaryMessage from "@effect/sharding/BinaryMessage"
import type * as ByteArray from "@effect/sharding/ByteArray"
import type * as PodAddress from "@effect/sharding/PodAddress"
import type * as ShardId from "@effect/sharding/ShardId"
import type * as ShardingError from "@effect/sharding/ShardingError"
import * as Stream from "@effect/stream/Stream"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId: unique symbol = Symbol.for("@effect/sharding/Pods")

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
  readonly ping: (pod: PodAddress.PodAddress) => Effect.Effect<never, ShardingError.ShardingPodUnavailableError, void>

  /**
   * Send a message to a pod
   * @since 1.0.0
   */
  readonly sendMessage: (
    pod: PodAddress.PodAddress,
    message: BinaryMessage.BinaryMessage
  ) => Effect.Effect<never, ShardingError.ShardingError, Option.Option<ByteArray.ByteArray>>

  /**
   * Send a message to a pod and receive a stream of replies
   * @since 1.0.0
   */
  readonly sendMessageStreaming: (
    pod: PodAddress.PodAddress,
    message: BinaryMessage.BinaryMessage
  ) => Stream.Stream<never, ShardingError.ShardingError, ByteArray.ByteArray>
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
  sendMessage: () => Effect.succeed(Option.none()),
  sendMessageStreaming: () => Stream.empty
})
