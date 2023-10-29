import * as Message from "@effect/cluster/Message"
import * as RecipientBehaviour from "@effect/cluster/RecipientBehaviour"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import { pipe } from "effect/Function"
import * as Option from "effect/Option"
import * as Ref from "effect/Ref"

export interface Itempotency<R, E, M> {
  (message: M): <R2, E2, A>(use: Effect.Effect<R2, E2, A>) => Effect.Effect<R | R2, E | E2, A>
}

export function make<R, E, M, T>(
  begin: (message: M) => Effect.Effect<R, E, T>,
  commit: (resource: T, message: M, reply: Option.Option<Message.Success<M>>) => Effect.Effect<R, never, void>,
  rollback: (resource: T, message: M) => Effect.Effect<R, never, void>
): Itempotency<R | RecipientBehaviour.RecipientBehaviourContext, E, M> {
  return (message) => (use) =>
    pipe(
      Ref.make(Option.none<Message.Success<M>>()),
      Effect.flatMap((ref) =>
        Effect.acquireUseRelease(
          begin(message),
          () =>
            pipe(
              use,
              // instead of immediately sending the reply, ensure it is delayed to be processed by "commit"
              Effect.updateService(RecipientBehaviour.RecipientBehaviourContext, (recipientContext) => ({
                ...recipientContext,
                reply: (replyId, reply) =>
                  Message.isMessage(message) && message.replier.id === replyId
                    ? Ref.set(ref, reply)
                    : recipientContext.reply(replyId, reply)
              }))
            ),
          (resource, exit) =>
            Exit.isFailure(exit) ? rollback(resource, message) : pipe(
              Ref.get(ref),
              // attempt to commit first
              Effect.tap((maybeReply) => commit(resource, message, maybeReply)),
              Effect.tap((maybeReply) =>
                Option.isSome(maybeReply) && Message.isMessage(message)
                  ? pipe(
                    RecipientBehaviour.RecipientBehaviourContext,
                    Effect.flatMap((_) => _.reply(message.replier.id, _))
                  )
                  : Effect.unit
              )
            )
        )
      )
    )
}
