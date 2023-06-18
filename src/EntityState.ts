import * as Data from "@effect/data/Data"
import type * as Option from "@effect/data/Option"
import type * as Deferred from "@effect/io/Deferred"
import type * as Queue from "@effect/io/Queue"
import type * as BinaryMessage from "@effect/shardcake/BinaryMessage"
import type * as ByteArray from "@effect/shardcake/ByteArray"
import type * as EntityManager from "@effect/shardcake/EntityManager"
import type * as ShardError from "@effect/shardcake/ShardError"

export const EntityStateTypeId = Symbol.for("@effect/shardcake/EntityState")
export type EntityStateTypeId = typeof EntityStateTypeId

export interface EntityState {
  [EntityStateTypeId]: {}
  binaryQueue: Queue.Queue<
    readonly [
      BinaryMessage.BinaryMessage,
      Deferred.Deferred<ShardError.Throwable, Option.Option<ByteArray.ByteArray>>,
      Deferred.Deferred<never, void>
    ]
  >
  entityManager: EntityManager.EntityManager<never>
}

export function apply(
  binaryQueue: EntityState["binaryQueue"],
  entityManager: EntityState["entityManager"]
): EntityState {
  return Data.struct({ [EntityStateTypeId]: {}, binaryQueue, entityManager })
}
