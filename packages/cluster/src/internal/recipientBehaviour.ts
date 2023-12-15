import { Deferred } from "effect"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as HashMap from "effect/HashMap"
import * as Option from "effect/Option"
import * as Queue from "effect/Queue"
import * as Ref from "effect/Ref"
import * as Message from "../Message.js"
import type * as MessageId from "../MessageId.js"
import * as MessageState from "../MessageState.js"
import * as PoisonPill from "../PoisonPill.js"
import type * as RecipientBehaviour from "../RecipientBehaviour.js"

/** @internal  */
export function fromFunctionEffect<Msg extends Message.AnyMessage, R>(
  handler: (entityId: string, message: Msg) => Effect.Effect<R, never, MessageState.MessageState<Message.Success<Msg>>>
): RecipientBehaviour.RecipientBehaviour<R, Msg> {
  return (entityId) =>
    pipe(
      Effect.context<R>(),
      Effect.map((context) => (message: Msg) => pipe(handler(entityId, message), Effect.provide(context)))
    )
}

/** @internal */
export function fromInMemoryQueue<Msg extends Message.AnyMessage, R>(
  handler: (
    entityId: string,
    dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>,
    reply: <A extends Msg>(msg: A, value: Message.Success<A>) => Effect.Effect<never, never, void>
  ) => Effect.Effect<R, never, void>
): RecipientBehaviour.RecipientBehaviour<R, Msg> {
  return (entityId) =>
    Effect.gen(function*(_) {
      const messageStates = yield* _(Ref.make(HashMap.empty<MessageId.MessageId, MessageState.MessageState<any>>()))

      function updateMessageState(message: Msg, state: MessageState.MessageState<any>) {
        if (!Message.isMessageWithResult(message)) return Effect.succeed(state)
        return pipe(Ref.update(messageStates, HashMap.set(Message.messageId(message), state)), Effect.as(state))
      }

      function getMessageState(message: Msg) {
        if (!Message.isMessageWithResult(message)) return Effect.succeed(Option.none())
        return pipe(
          Ref.get(messageStates),
          Effect.map(HashMap.get(Message.messageId(message)))
        )
      }

      function reply<A extends Msg>(message: A, reply: Message.Success<A>) {
        return updateMessageState(message, MessageState.Processed(Option.some(reply)))
      }

      return yield* _(pipe(
        Deferred.make<never, boolean>(),
        Effect.flatMap((shutdownCompleted) =>
          pipe(
            Effect.acquireRelease(
              Queue.unbounded<Msg | PoisonPill.PoisonPill>(),
              (queue) =>
                pipe(
                  PoisonPill.make,
                  Effect.flatMap((msg) => Queue.offer(queue, msg)),
                  Effect.zipLeft(Deferred.await(shutdownCompleted)),
                  Effect.uninterruptible
                )
            ),
            Effect.tap((queue) =>
              pipe(
                Effect.logDebug("Behaviour started."),
                Effect.zipRight(handler(entityId, queue, reply)),
                Effect.ensuring(Deferred.succeed(shutdownCompleted, true)),
                Effect.zipRight(Effect.logDebug("Behaviour exited.")),
                Effect.annotateLogs("entityId", entityId),
                Effect.forkDaemon
              )
            ),
            Effect.map((queue) => (message: Msg) => {
              return pipe(
                getMessageState(message),
                Effect.flatMap(Option.match({
                  onNone: () =>
                    pipe(
                      Queue.offer(queue, message),
                      Effect.zipRight(updateMessageState(message, MessageState.Acknowledged))
                    ),
                  onSome: (state) => Effect.succeed(state)
                }))
              )
            }),
            Effect.annotateLogs("entityId", entityId)
          )
        )
      ))
    })
}
