/**
 * @since 1.0.0
 */
import type { Schedule } from "effect"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Option from "effect/Option"
import * as Stream from "effect/Stream"
import type * as Message from "./Message.js"
import * as MessageState from "./MessageState.js"
import type * as RecipientBehaviour from "./RecipientBehaviour.js"
import * as RecipientBehaviourContext from "./RecipientBehaviourContext.js"
import type * as RecipientType from "./RecipientType.js"
import type * as SerializedEnvelope from "./SerializedEnvelope.js"
import type * as ShardId from "./ShardId.js"
import * as Sharding from "./Sharding.js"
import type * as ShardingError from "./ShardingError.js"

export interface AtLeastOnceStorage {
  /**
   * Stores a message into the storage, eventually returning the already existing message state as result in the storage
   */
  upsert<Msg extends Message.Any>(
    recipientType: RecipientType.RecipientType<Msg>,
    entityId: string,
    message: Msg
  ): Effect.Effect<
    never,
    ShardingError.ShardingErrorWhileOfferingMessage,
    Option.Option<MessageState.MessageState<Message.Success<Msg>>>
  >

  /**
   * Marks the message as processed, so no more send attempt will occur
   */
  markAsProcessed<Msg extends Message.Any>(
    recipientType: RecipientType.RecipientType<Msg>,
    entityId: string,
    message: Msg
  ): Effect.Effect<never, ShardingError.ShardingErrorWhileOfferingMessage, void>

  /**
   * Gets a set of messages that will be sent to the local Pod as second attempt
   */
  sweepPending(
    shardIds: Iterable<ShardId.ShardId>
  ): Stream.Stream<never, never, SerializedEnvelope.SerializedEnvelope>
}

const AtLeastOnceStorageTag = Context.Tag<AtLeastOnceStorage>()

export function runPendingMessageSweeper<E, O>(schedule: Schedule.Schedule<E, unknown, O>) {
  return Effect.flatMap(AtLeastOnceStorageTag, (storage) =>
    pipe(
      Sharding.getAssignedShardIds,
      Effect.flatMap((shardIds) =>
        pipe(
          storage.sweepPending(shardIds),
          Stream.mapEffect((envelope) => Sharding.sendMessageToLocalEntityManagerWithoutRetries(envelope)),
          Stream.runDrain
        )
      ),
      Effect.scheduleForked(schedule),
      Effect.asUnit
    ))
}

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
                storage.upsert(recipientType, entityId, message),
                Effect.flatMap(Option.match({
                  onNone: () =>
                    pipe(
                      offer(message),
                      Effect.tap(MessageState.match({
                        onAcknowledged: () => Effect.unit,
                        onProcessed: () => storage.markAsProcessed(recipientType, entityId, message)
                      }))
                    ),
                  onSome: Effect.succeed
                }))
              )
            )
          ))
    )
}
