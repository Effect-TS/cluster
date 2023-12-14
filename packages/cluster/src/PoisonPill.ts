/**
 * @since 1.0.0
 */
import type * as Data from "effect/Data"
import type * as Effect from "effect/Effect"
import type * as Queue from "effect/Queue"
import * as internal from "./internal/poisonPill.js"
import type * as Message from "./Message.js"

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
  Message.Message<
    Data.Data<
      {
        [PoisonPillTypeId]: PoisonPillTypeId
      }
    >
  >
{}

/**
 * `PoisonPill`
 *
 * @since 1.0.0
 * @category constructors
 */
export const make: Effect.Effect<never, never, PoisonPill> = internal.make

/**
 * @since 1.0.0
 * @category utils
 */
export const isPoisonPill: (value: unknown) => value is PoisonPill = internal.isPoisonPill

/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema: Message.MessageSchema<
  { readonly "@effect/cluster/PoisonPill": "@effect/cluster/PoisonPill" },
  Data.Data<{ readonly [PoisonPillTypeId]: typeof PoisonPillTypeId }>
> = internal.schema

/**
 * Attempts to take a message from the queue in the same way Queue.take does.
 * If the result is a PoisonPill, it will interrupt the effect.
 *
 * @since 1.0.0
 * @category schema
 */
export const takeOrInterrupt: <Req>(dequeue: Queue.Dequeue<PoisonPill | Req>) => Effect.Effect<never, never, Req> =
  internal.takeOrInterrupt
