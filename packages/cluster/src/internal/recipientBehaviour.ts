import { Deferred } from "effect"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Queue from "effect/Queue"
import * as PoisonPill from "../PoisonPill.js"
import type * as RecipientBehaviour from "../RecipientBehaviour.js"
import * as RecipientBehaviourContext from "../RecipientBehaviourContext.js"
import * as ReplyId from "../ReplyId.js"
import type * as ShardingError from "../ShardingError.js"

/** @internal */
export function fromInMemoryQueue<R, Msg>(
  handler: (
    entityId: string,
    dequeue: Queue.Dequeue<[Msg | PoisonPill.PoisonPill, ReplyId.ReplyId]>,
    reply: (replyId: ReplyId.ReplyId, reply: unknown) => Effect.Effect<never, never, void>
  ) => Effect.Effect<R, never, void>
): RecipientBehaviour.RecipientBehaviour<R, Msg> {
  return pipe(
    Deferred.make<never, boolean>(),
    Effect.flatMap((shutdownCompleted) =>
      pipe(
        RecipientBehaviourContext.RecipientBehaviourContext,
        Effect.flatMap(({ entityId }) =>
          pipe(
            Effect.acquireRelease(
              Queue.unbounded<[Msg | PoisonPill.PoisonPill, ReplyId.ReplyId]>(),
              (queue) =>
                pipe(
                  ReplyId.makeEffect,
                  Effect.flatMap((replyId) => Queue.offer(queue, [PoisonPill.make, replyId])),
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
            Effect.map((queue) => (message: Msg) =>
              pipe(
                ReplyId.makeEffect,
                Effect.tap((replyId) => Queue.offer(queue, [message, replyId]))
              )
            ),
            Effect.annotateLogs("entityId", entityId)
          )
        )
      )
    )
  )
}

/** @internal */
export function mapOffer<Msg1, Msg>(
  f: (
    offer: (message: Msg1) => Effect.Effect<never, ShardingError.ShardingErrorMessageQueue, ReplyId.ReplyId>
  ) => (message: Msg) => Effect.Effect<never, ShardingError.ShardingErrorMessageQueue, ReplyId.ReplyId>
) {
  return <R>(base: RecipientBehaviour.RecipientBehaviour<R, Msg1>): RecipientBehaviour.RecipientBehaviour<R, Msg> =>
  (entityId) =>
    pipe(
      base(entityId),
      Effect.map((offer) => f(offer))
    )
}
