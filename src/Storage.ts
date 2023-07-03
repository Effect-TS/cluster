/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context"
import { pipe } from "@effect/data/Function"
import * as HashMap from "@effect/data/HashMap"
import type * as Option from "@effect/data/Option"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import * as Ref from "@effect/io/Ref"
import type * as Pod from "@effect/shardcake/Pod"
import type * as PodAddress from "@effect/shardcake/PodAddress"
import type * as ShardId from "@effect/shardcake/ShardId"
import * as Stream from "@effect/stream/Stream"
import * as SubscriptionRef from "@effect/stream/SubscriptionRef"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId: unique symbol = Symbol.for("@effect/shardcake/StorageTypeId")

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface Storage {
  /**
   * Get the current state of shard assignments to pods
   */
  getAssignments: Effect.Effect<never, never, HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>>

  /**
   * Save the current state of shard assignments to pods
   */
  saveAssignments(
    assignments: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
  ): Effect.Effect<never, never, void>

  /**
   * A stream that will emit the state of shard assignments whenever it changes
   */
  assignmentsStream: Stream.Stream<
    never,
    never,
    HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
  >

  /**
   * Get the list of existing pods
   */
  getPods: Effect.Effect<never, never, HashMap.HashMap<PodAddress.PodAddress, Pod.Pod>>

  /**
   * Save the list of existing pods
   */
  savePods(pods: HashMap.HashMap<PodAddress.PodAddress, Pod.Pod>): Effect.Effect<never, never, void>
}
export const Storage = Tag<Storage>()

/**
 * A layer that stores data in-memory.
 * This is useful for testing with a single pod only.
 *
 * @since 1.0.0
 * @category layers
 */
export const memory = Layer.effect(
  Storage,
  Effect.gen(function*($) {
    const assignmentsRef = yield* $(
      SubscriptionRef.make(HashMap.empty<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>())
    )
    const podsRef = yield* $(Ref.make(HashMap.empty<PodAddress.PodAddress, Pod.Pod>()))

    return {
      getAssignments: SubscriptionRef.get(assignmentsRef),
      saveAssignments: (assignments) => pipe(assignmentsRef, SubscriptionRef.set(assignments)),
      assignmentsStream: assignmentsRef.changes,
      getPods: Ref.get(podsRef),
      savePods: (pods) => pipe(podsRef, Ref.set(pods))
    }
  })
)

/**
 * A layer that does nothing, useful for testing.
 *
 * @since 1.0.0
 * @category layers
 */
export const noop = Layer.effect(
  Storage,
  Effect.succeed({
    getAssignments: Effect.succeed(HashMap.empty()),
    saveAssignments: () => Effect.unit(),
    assignmentsStream: Stream.empty,
    getPods: Effect.succeed(HashMap.empty()),
    savePods: () => Effect.unit()
  })
)
