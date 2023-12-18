/**
 * @since 1.0.0
 */
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Option from "effect/Option"
import type * as Message from "./Message.js"
import type * as MessageState from "./MessageState.js"
import type * as RecipientBehaviour from "./RecipientBehaviour.js"
import * as RecipientBehaviourContext from "./RecipientBehaviourContext.js"
import type * as RecipientType from "./RecipientType.js"
import type * as ShardingError from "./ShardingError.js"

export interface AtLeastOnceStorage {
  /**
   * Stores a message into the storage, eventually returning the already existing message state as result in the storage
   */
  upsertMessageToBeProcessed<Msg extends Message.Any>(
    recipientType: RecipientType.RecipientType<Msg>,
    entityId: string,
    message: Msg
  ): Effect.Effect<
    never,
    ShardingError.ShardingErrorMessageQueue,
    Option.Option<MessageState.MessageState<Message.Success<Msg>>>
  >

  /**
   * Stores the message state to be used as result for this message
   */
  saveProcessedMessageState<Msg extends Message.Any>(
    recipientType: RecipientType.RecipientType<Msg>,
    entityId: string,
    message: Msg,
    messageState: MessageState.MessageState<Message.Success<Msg>>
  ): Effect.Effect<never, ShardingError.ShardingErrorMessageQueue, void>
}

const AtLeastOnceStorageTag = Context.Tag<AtLeastOnceStorage>()

export function make<Msg extends Message.Any>(recipientType: RecipientType.RecipientType<Msg>) {
  return <R>(
    fa: RecipientBehaviour.RecipientBehaviour<R, Msg>
  ): RecipientBehaviour.RecipientBehaviour<R | AtLeastOnceStorage, Msg> =>
    Effect.flatMap(
      AtLeastOnceStorageTag,
      (storage) =>
        Effect.flatMap(RecipientBehaviourContext.entityId, (entityId) =>
          pipe(
            fa,
            Effect.map((offer) => <A extends Msg>(message: A) =>
              pipe(
                storage.upsertMessageToBeProcessed(recipientType, entityId, message),
                Effect.flatMap(Option.match({
                  onNone: () =>
                    pipe(
                      offer(message),
                      Effect.tap((messageState) =>
                        storage.saveProcessedMessageState(recipientType, entityId, message, messageState)
                      )
                    ),
                  onSome: Effect.succeed
                }))
              )
            )
          ))
    )
}
