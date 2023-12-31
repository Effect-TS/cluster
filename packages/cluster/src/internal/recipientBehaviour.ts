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
import * as RecipientBehaviourContext from "../RecipientBehaviourContext.js"

/** @internal  */
export function fromFunctionEffect<R, Msg extends Message.Any>(
  handler: (entityId: string, message: Msg) => Effect.Effect<R, never, MessageState.MessageState<Message.Exit<Msg>>>
): RecipientBehaviour.RecipientBehaviour<R, Msg> {
  return Effect.flatMap(RecipientBehaviourContext.entityId, (entityId) =>
    pipe(
      Effect.context<R>(),
      Effect.map((context) => (message: Msg) =>
        pipe(
          handler(entityId, message),
          Effect.provide(context)
        )
      )
    ))
}

/** @internal  */
export function fromFunctionEffectStateful<R, S, R2, Msg extends Message.Any>(
  initialState: (entityId: string) => Effect.Effect<R, never, S>,
  handler: (
    entityId: string,
    message: Msg,
    stateRef: Ref.Ref<S>
  ) => Effect.Effect<R2, never, MessageState.MessageState<Message.Exit<Msg>>>
): RecipientBehaviour.RecipientBehaviour<R | R2, Msg> {
  return Effect.flatMap(RecipientBehaviourContext.entityId, (entityId) =>
    pipe(
      initialState(entityId),
      Effect.flatMap(Ref.make),
      Effect.flatMap((stateRef) =>
        pipe(
          Effect.context<R2>(),
          Effect.map((context) => (message: Msg) =>
            pipe(
              handler(entityId, message, stateRef),
              Effect.provide(context)
            )
          )
        )
      )
    ))
}

/** @internal */
export function fromInMemoryQueue<R, Msg extends Message.Any>(
  handler: (
    entityId: string,
    dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>,
    processed: <A extends Msg>(
      message: A,
      value: Option.Option<Message.Exit<A>>
    ) => Effect.Effect<never, never, void>
  ) => Effect.Effect<R, never, void>
): RecipientBehaviour.RecipientBehaviour<R, Msg> {
  return Effect.gen(function*(_) {
    const entityId = yield* _(RecipientBehaviourContext.entityId)
    const messageStates = yield* _(Ref.make(HashMap.empty<MessageId.MessageId, MessageState.MessageState<any>>()))

    function updateMessageState(message: Msg, state: MessageState.MessageState<any>) {
      return pipe(Ref.update(messageStates, HashMap.set(Message.messageId(message), state)), Effect.as(state))
    }

    function getMessageState(message: Msg) {
      return pipe(
        Ref.get(messageStates),
        Effect.map(HashMap.get(Message.messageId(message)))
      )
    }

    function reply<A extends Msg>(message: A, reply: Option.Option<Message.Exit<A>>) {
      return updateMessageState(message, MessageState.Processed(reply))
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
