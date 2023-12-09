/**
 * @since 1.0.0
 */
import type * as Schema from "@effect/schema/Schema"
import type * as Data from "effect/Data"
import type * as Effect from "effect/Effect"
import type * as Queue from "effect/Queue"
import * as internal from "./internal/poisonPill.js"
import type * as ReplyId from "./MessageId.js"

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
export const isPoisonPill: (value: unknown) => value is PoisonPill = internal.isPoisonPill

/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema: Schema.Schema<
  { readonly "@effect/cluster/PoisonPill": "@effect/cluster/PoisonPill" },
  PoisonPill
> = internal.schema

/**
 * Attempts to take a message from the queue in the same way Queue.take does.
 * If the result is a PoisonPill, it will interrupt the effect.
 *
 * @since 1.0.0
 * @category schema
 */
export const takeOrInterrupt: <Req>(
  dequeue: Queue.Dequeue<[PoisonPill | Req, ReplyId.ReplyId]>
) => Effect.Effect<never, never, [Req, ReplyId.ReplyId]> = internal.takeOrInterrupt
