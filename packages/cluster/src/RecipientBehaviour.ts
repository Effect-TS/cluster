/**
 * A module that provides utilities to build basic behaviours
 * @since 1.0.0
 */
import type * as Duration from "effect/Duration"
import type * as Effect from "effect/Effect"
import type * as Option from "effect/Option"
import type * as Queue from "effect/Queue"
import type * as Scope from "effect/Scope"
import * as internal from "./internal/recipientBehaviour.js"
import type * as Message from "./Message.js"
import type * as PoisonPill from "./PoisonPill.js"
import type * as RecipientBehaviourContext from "./RecipientBehaviourContext.js"
import type * as ReplyId from "./ReplyId.js"
import type * as SerializedMessage from "./SerializedMessage.js"
import type * as ShardingError from "./ShardingError.js"

/**
 * An alias to a RecipientBehaviour
 * @since 1.0.0
 * @category models
 */
export interface RecipientBehaviour<R, Msg> extends
  Effect.Effect<
    R | RecipientBehaviourContext.RecipientBehaviourContext | Scope.Scope,
    never,
    RecipientBehaviourInstance<Msg>
  >
{}

export interface RecipientBehaviourInstance<Msg> {
  offer: (msg: Msg) => Effect.Effect<never, ShardingError.ShardingErrorMessageQueue, ReplyId.ReplyId>
  pullReply: (
    replyId: ReplyId.ReplyId
  ) => Effect.Effect<never, ShardingError.ShardingErrorMessageQueue, Message.Success<Msg>>
}

/**
 * An utility that process a message at a time, or interrupts on PoisonPill
 * @since 1.0.0
 * @category utils
 */
export type EntityBehaviourOptions = {
  entityMaxIdleTime?: Option.Option<Duration.Duration>
}

/**
 * @since 1.0.0
 * @category utils
 */
export const fromInMemoryQueue: <R, Msg>(
  handler: (
    entityId: string,
    dequeue: Queue.Dequeue<[Msg | PoisonPill.PoisonPill, ReplyId.ReplyId]>
  ) => Effect.Effect<R, never, void>
) => RecipientBehaviour<R, Msg> = internal.fromInMemoryQueue

/**
 * @since 1.0.0
 * @category utils
 */
export const mapOffer: <Msg1, Msg>(
  f: (
    offer: (message: Msg1) => Effect.Effect<never, ShardingError.ShardingErrorMessageQueue, ReplyId.ReplyId>
  ) => (message: Msg) => Effect.Effect<never, ShardingError.ShardingErrorMessageQueue, ReplyId.ReplyId>
) => <R>(base: RecipientBehaviour<R, Msg1>) => RecipientBehaviour<R, Msg> = internal.mapOffer
