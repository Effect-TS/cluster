import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import { Tag } from "@fp-ts/data/Context";
import { pipe } from "@fp-ts/data/Function";
import * as Option from "@fp-ts/data/Option";
import { PodAddress } from "./PodAddress";
import { Pods } from "./Pods";
import * as Schema from "@fp-ts/schema/Schema";
import * as These from "@fp-ts/data/These";
import * as Either from "@fp-ts/data/Either";
import * as ShardError from "./ShardError";
import * as HashMap from "@fp-ts/data/HashMap";
import { ShardId } from "./ShardId";
import * as Stream from "@effect/stream/Stream";
import * as SubscriptionRef from "@effect/stream/SubscriptionRef";
import * as Ref from "@effect/io/Ref";
import { Pod } from "./Pod";

/**
 * @since 1.0.0
 * @category symbols
 */
export const StorageTypeId: unique symbol = Symbol.for("@effect/shardcake/StorageTypeId");

/**
 * @since 1.0.0
 * @category symbols
 */
export type StorageTypeId = typeof StorageTypeId;

export interface Storage {
  [StorageTypeId]: {};

  /**
   * Get the current state of shard assignments to pods
   */
  getAssignments(): Effect.Effect<
    never,
    never,
    HashMap.HashMap<ShardId, Option.Option<PodAddress>>
  >;

  /**
   * Save the current state of shard assignments to pods
   */
  saveAssignments(
    assignments: HashMap.HashMap<ShardId, Option.Option<PodAddress>>
  ): Effect.Effect<never, never, void>;

  /**
   * A stream that will emit the state of shard assignments whenever it changes
   */
  assignmentsStream(): Stream.Stream<
    never,
    never,
    HashMap.HashMap<ShardId, Option.Option<PodAddress>>
  >;

  /**
   * Get the list of existing pods
   */
  getPods(): Effect.Effect<never, never, HashMap.HashMap<PodAddress, Pod>>;

  /**
   * Save the list of existing pods
   */
  savePods(pods: HashMap.HashMap<PodAddress, Pod>): Effect.Effect<never, never, void>;
}
export const Storage = Tag<Storage>();

/**
 * A layer that stores data in-memory.
 * This is useful for testing with a single pod only.
 */

export const memory = Layer.effect(Storage)(
  Effect.gen(function* ($) {
    const assignmentsRef = yield* $(
      SubscriptionRef.make(HashMap.empty<ShardId, Option.Option<PodAddress>>())
    );
    const podsRef = yield* $(Ref.make(HashMap.empty<PodAddress, Pod>()));

    return {
      [StorageTypeId]: {},
      getAssignments: () => SubscriptionRef.get(assignmentsRef),
      saveAssignments: (assignments) => pipe(assignmentsRef, SubscriptionRef.set(assignments)),
      assignmentsStream: () => assignmentsRef.changes,
      getPods: () => Ref.get(podsRef),
      savePods: (pods) => pipe(podsRef, Ref.set(pods)),
    } as Storage;
  })
);
