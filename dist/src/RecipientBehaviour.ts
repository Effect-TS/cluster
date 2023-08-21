/**
 * A module that provides utilities to build basic behaviours
 * @since 1.0.0
 */
import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import type * as Queue from "@effect/io/Queue"
import * as PoisonPill from "@effect/shardcake/PoisonPill"

/**
 * An alias to a RecipientBehaviour
 * @since 1.0.0
 * @category models
 */
export interface RecipientBehaviour<R, Req> {
  (
    entityId: string,
    dequeue: Queue.Dequeue<Req | PoisonPill.PoisonPill>
  ): Effect.Effect<R, never, void>
}

/**
 * An utility that process a message at a time, or interrupts on PoisonPill
 * @since 1.0.0
 * @category utils
 */
export const process = <Msg, R, E>(
  dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>,
  process: (message: Msg) => Effect.Effect<R, E, void>
) =>
  pipe(
    PoisonPill.takeOrInterrupt(dequeue),
    Effect.flatMap(process),
    Effect.forever
  )
