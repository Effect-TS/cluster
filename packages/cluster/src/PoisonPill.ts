/**
 * @since 1.0.0
 */
import type * as Data from "effect/Data"
import * as internal from "./internal/poisonPill.js"

/**
 * @since 1.0.0
 * @category symbols
 */
export const PoisonPillTypeId: unique symbol = internal.PoisonPillTypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export type PoisonPillTypeId = typeof PoisonPillTypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface PoisonPill extends
  Data.Data<{
    [PoisonPillTypeId]: PoisonPillTypeId
  }>
{}

/**
 * `PoisonPill`
 *
 * @since 1.0.0
 * @category constructors
 */
export const make: PoisonPill = internal.make

/**
 * @since 1.0.0
 * @category utils
 */
export const isPoisonPill = internal.isPoisonPill

/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema = internal.schema

/**
 * Attempts to take a message from the queue in the same way Queue.take does.
 * If the result is a PoisonPill, it will interrupt the effect.
 *
 * @since 1.0.0
 * @category schema
 */
export const takeOrInterrupt = internal.takeOrInterrupt
