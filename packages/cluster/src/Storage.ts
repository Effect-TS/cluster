/**
 * @since 1.0.0
 */
import { Tag } from "effect/Context"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as HashMap from "effect/HashMap"
import * as Layer from "effect/Layer"
import type * as Option from "effect/Option"
import * as Ref from "effect/Ref"
import * as Stream from "effect/Stream"
import * as SubscriptionRef from "effect/SubscriptionRef"
import type * as Pod from "./Pod.js"
import type * as PodAddress from "./PodAddress.js"
import type * as ShardId from "./ShardId.js"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId: unique symbol = Symbol.for("@effect/cluster/StorageTypeId")

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
  readonly getAssignments: Effect.Effect<
    never,
    never,
    HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
  >

  /**
   * Save the current state of shard assignments to pods
   */
  readonly saveAssignments: (
    assignments: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
  ) => Effect.Effect<never, never, void>

  /**
   * A stream that will emit the state of shard assignments whenever it changes
   */
  readonly assignmentsStream: Stream.Stream<
    never,
    never,
    HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
  >

  /**
   * Get the list of existing pods
   */
  readonly getPods: Effect.Effect<never, never, HashMap.HashMap<PodAddress.PodAddress, Pod.Pod>>

  /**
   * Save the list of existing pods
   */
  readonly savePods: (pods: HashMap.HashMap<PodAddress.PodAddress, Pod.Pod>) => Effect.Effect<never, never, void>
}

/**
 * @since 1.0.0
 * @category context
 */
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
    saveAssignments: () => Effect.unit,
    assignmentsStream: Stream.empty,
    getPods: Effect.succeed(HashMap.empty()),
    savePods: () => Effect.unit
  })
)
