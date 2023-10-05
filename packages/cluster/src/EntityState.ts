/**
 * @since 1.0.0
 */
import type * as EntityManager from "@effect/cluster/EntityManager"
import * as Data from "effect/Data"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = Symbol.for("@effect/cluster/EntityState")

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
  readonly _id: TypeId
  readonly entityManager: EntityManager.EntityManager<unknown>
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function make(
  entityManager: EntityState["entityManager"]
): EntityState {
  return Data.struct({ _id: TypeId, entityManager })
}
