/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Queue from "effect/Queue"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "./PoisonPill"

/**
 * @since 1.0.0
 * @category models
 */
export interface PoisonPill extends Schema.Schema.To<typeof schema> {}

/**
 * `PoisonPill`
 *
 * @since 1.0.0
 * @category constructors
 */
export const make: PoisonPill = Data.struct({ _id: TypeId })

/**
 * @since 1.0.0
 * @category utils
 */
export function isPoisonPill(value: unknown): value is PoisonPill {
  return (
    typeof value === "object" &&
    value !== null &&
    "_id" in value &&
    value["_id"] === TypeId
  )
}

/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema = Schema.data(
  Schema.struct({
    _id: Schema.literal(TypeId)
  })
)

/**
 * Attempts to take a message from the queue in the same way Queue.take does.
 * If the result is a PoisonPill, it will interrupt the effect.
 *
 * @since 1.0.0
 * @category schema
 */
export function takeOrInterrupt<Req>(dequeue: Queue.Dequeue<Req | PoisonPill>): Effect.Effect<never, never, Req> {
  return pipe(
    Queue.take(dequeue),
    Effect.flatMap((msg) => isPoisonPill(msg) ? Effect.interrupt : Effect.succeed(msg))
  )
}
