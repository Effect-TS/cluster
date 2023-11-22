import { Deferred } from "effect"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Queue from "effect/Queue"
import * as PoisonPill from "../PoisonPill.js"
import type * as RecipientBehaviour from "../RecipientBehaviour.js"
import type * as ShardingError from "../ShardingError.js"

/** @internal */
export function fromInMemoryQueue<R, Msg>(
  handler: (entityId: string, dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>) => Effect.Effect<R, never, void>
): RecipientBehaviour.RecipientBehaviour<R, Msg> {
  return (entityId) =>
    pipe(
      Deferred.make<never, boolean>(),
      Effect.flatMap((shutdownCompleted) =>
        pipe(
          Effect.acquireRelease(
            Queue.unbounded<Msg | PoisonPill.PoisonPill>(),
            (queue) =>
              pipe(
                Queue.offer(queue, PoisonPill.make),
                Effect.zipRight(
                  Effect.logDebug("PoisonPill sent. Waiting for exit of behaviour...")
                ),
                Effect.zipLeft(Deferred.await(shutdownCompleted)),
                Effect.uninterruptible
              )
          ),
          Effect.tap((queue) =>
            pipe(
              Effect.logDebug("Behaviour started."),
              Effect.zipRight(handler(entityId, queue)),
              Effect.ensuring(Deferred.succeed(shutdownCompleted, true)),
              Effect.zipRight(Effect.logDebug("Behaviour exited.")),
              Effect.annotateLogs("entityId", entityId),
              Effect.forkDaemon
            )
          ),
          Effect.map((queue) => (message: Msg) => Queue.offer(queue, message)),
          Effect.annotateLogs("entityId", entityId)
        )
      )
    )
}

/** @internal */
export function mapOffer<Msg1, Msg>(
  f: (
    offer: (message: Msg1) => Effect.Effect<never, ShardingError.ShardingErrorMessageQueue, void>
  ) => (message: Msg) => Effect.Effect<never, ShardingError.ShardingErrorMessageQueue, void>
) {
  return <R>(base: RecipientBehaviour.RecipientBehaviour<R, Msg1>): RecipientBehaviour.RecipientBehaviour<R, Msg> =>
  (entityId) =>
    pipe(
      base(entityId),
      Effect.map((offer) => f(offer))
    )
}
