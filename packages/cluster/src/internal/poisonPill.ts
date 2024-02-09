import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Queue from "effect/Queue"
import type * as PoisonPill from "../PoisonPill.js"

/** @internal */
const PoisonPillSymbolKey = "@effect/cluster/PoisonPill"

/** @internal */
export const PoisonPillTypeId: PoisonPill.PoisonPillTypeId = Symbol.for(
  PoisonPillSymbolKey
) as PoisonPill.PoisonPillTypeId

/**
 * `PoisonPill`
 *
 * @since 1.0.0
 * @category constructors
 */
export const make: Effect.Effect<PoisonPill.PoisonPill> = Effect.succeed(
  Data.struct({ [PoisonPillTypeId]: PoisonPillTypeId })
)

/**
 * @since 1.0.0
 * @category utils
 */
export function isPoisonPill(value: unknown): value is PoisonPill.PoisonPill {
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
  { readonly [PoisonPill.PoisonPillTypeId]: typeof PoisonPill.PoisonPillTypeId },
  { readonly "@effect/cluster/PoisonPill": "@effect/cluster/PoisonPill" }
> = Schema.data(Schema.rename(
  Schema.struct({
    [PoisonPillSymbolKey]: Schema.compose(
      Schema.compose(Schema.literal(PoisonPillSymbolKey), Schema.symbol, { strict: false }),
      Schema.uniqueSymbol(PoisonPillTypeId),
      { strict: false }
    )
  }),
  { [PoisonPillSymbolKey]: PoisonPillTypeId }
))

/**
 * Attempts to take a message from the queue in the same way Queue.take does.
 * If the result is a PoisonPill, it will interrupt the effect.
 *
 * @since 1.0.0
 * @category schema
 */
export function takeOrInterrupt<Req>(
  dequeue: Queue.Dequeue<Req | PoisonPill.PoisonPill>
): Effect.Effect<Req> {
  return pipe(
    Queue.take(dequeue),
    Effect.flatMap((msg) => isPoisonPill(msg) ? Effect.interrupt : Effect.succeed(msg))
  )
}
