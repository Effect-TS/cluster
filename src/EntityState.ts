/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import type * as Option from "@effect/data/Option"
import type * as Deferred from "@effect/io/Deferred"
import type * as Queue from "@effect/io/Queue"
import type * as BinaryMessage from "@effect/shardcake/BinaryMessage"
import type * as ByteArray from "@effect/shardcake/ByteArray"
import type * as EntityManager from "@effect/shardcake/EntityManager"
import type * as ShardError from "@effect/shardcake/ShardError"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = Symbol.for("@effect/shardcake/EntityState")

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface EntityState {
  [TypeId]: {}
  binaryQueue: Queue.Queue<
    readonly [
      BinaryMessage.BinaryMessage,
      Deferred.Deferred<ShardError.Throwable, Option.Option<ByteArray.ByteArray>>,
      Deferred.Deferred<never, void>
    ]
  >
  entityManager: EntityManager.EntityManager<never>
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function make(
  binaryQueue: EntityState["binaryQueue"],
  entityManager: EntityState["entityManager"]
): EntityState {
  return Data.struct({ [TypeId]: {}, binaryQueue, entityManager })
}
