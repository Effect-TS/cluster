/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Queue from "effect/Queue"
import { TypeIdSchema } from "./internal/utils.js"

/** @internal */
const PoisonPillSymbolKey = "@effect/cluster/PoisonPill"

/**
 * @since 1.0.0
 * @category symbols
 */
export const PoisonPillTypeId: unique symbol = Symbol.for(PoisonPillSymbolKey)

/**
 * @since 1.0.0
 * @category symbols
 */
export type PoisonPillTypeId = typeof PoisonPillTypeId

/** @internal */
const PoisonPillTypeIdSchema = TypeIdSchema(PoisonPillSymbolKey, PoisonPillTypeId)

/**
 * @since 1.0.0
 */
export namespace PoisonPill {
  /**
   * @since 1.0.0
   * @category models
   */
  export interface Encoded extends Schema.Schema.Encoded<typeof PoisonPill> {}
}

/**
 * @since 1.0.0
 * @category models
 */
export class PoisonPill extends Schema.Class<PoisonPill>(PoisonPillSymbolKey)({
  [PoisonPillTypeId]: Schema.propertySignature(PoisonPillTypeIdSchema).pipe(Schema.fromKey(PoisonPillSymbolKey))
}) {
}

/**
 * `PoisonPill`
 *
 * @since 1.0.0
 * @category constructors
 */
export const make: Effect.Effect<PoisonPill> = Effect.succeed(
  new PoisonPill({ [PoisonPillTypeId]: PoisonPillTypeId })
)

/**
 * @since 1.0.0
 * @category utils
 */
export function isPoisonPill(value: unknown): value is PoisonPill {
  return (
    typeof value === "object" &&
    value !== null &&
    PoisonPillTypeId in value &&
    value[PoisonPillTypeId] === PoisonPillTypeId
  )
}

/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema: Schema.Schema<
  PoisonPill,
  PoisonPill.Encoded
> = Schema.asSchema(PoisonPill)

/**
 * Attempts to take a message from the queue in the same way Queue.take does.
 * If the result is a PoisonPill, it will interrupt the effect.
 *
 * @since 1.0.0
 * @category utils
 */
export function takeOrInterrupt<Req>(
  dequeue: Queue.Dequeue<Req | PoisonPill>
): Effect.Effect<Req> {
  return pipe(
    Queue.take(dequeue),
    Effect.flatMap((msg) => isPoisonPill(msg) ? Effect.interrupt : Effect.succeed(msg))
  )
}
