import { BinaryMessage } from "./BinaryMessage";
import { PodAddress } from "./PodAddress";
import { ShardId } from "./ShardId";
import * as Effect from "@effect/io/Effect";
import * as Option from "@fp-ts/data/Option";
import { Tag } from "@fp-ts/data/Context";

/**
 * @since 1.0.0
 * @category symbols
 */
export const PodsTypeId: unique symbol = Symbol.for("@effect/shardcake/Pods");

/**
 * @since 1.0.0
 * @category symbols
 */
export type PodsTypeId = typeof PodsTypeId;

/**
 * An interface to communicate with remote pods.
 * This is used by the Shard Manager for assigning and unassigning shards.
 * This is also used by pods for internal communication (forward messages to each other).
 */
export interface Pods {
  [PodsTypeId]: {};
  /**
   * Notify a pod that it was assigned a list of shards
   */
  assignShards(pod: PodAddress, shards: Set<ShardId>): Effect.Effect<never, never, void>;

  /**
   * Notify a pod that it was unassigned a list of shards
   */
  unassignShards(pod: PodAddress, shards: Set<ShardId>): Effect.Effect<never, never, void>;

  /**
   * Check that a pod is responsive
   */
  ping(pod: PodAddress): Effect.Effect<never, never, void>;

  /**
   * Send a message to a pod
   */
  sendMessage(
    pod: PodAddress,
    message: BinaryMessage
  ): Effect.Effect<never, never, Option.Option<unknown>>;
}

export const Pods = Tag<Pods>();
