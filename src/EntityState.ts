/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import type * as Option from "@effect/data/Option"
import type * as Effect from "@effect/io/Effect"
import type * as Schema from "@effect/schema/Schema"
import type * as BinaryMessage from "@effect/shardcake/BinaryMessage"
import type * as EntityManager from "@effect/shardcake/EntityManager"
import type * as ReplyChannel from "@effect/shardcake/ReplyChannel"

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
  entityManager: EntityManager.EntityManager<never>
  processBinary: (
    binaryMessage: BinaryMessage.BinaryMessage,
    replyChannel: ReplyChannel.ReplyChannel<any>
  ) => Effect.Effect<never, never, Option.Option<Schema.Schema<any, any>>>
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function make(
  entityManager: EntityState["entityManager"],
  processBinary: EntityState["processBinary"]
): EntityState {
  return Data.struct({ [TypeId]: {}, entityManager, processBinary })
}
