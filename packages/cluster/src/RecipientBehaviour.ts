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
import type * as MessageState from "./MessageState.js"
import type * as PoisonPill from "./PoisonPill.js"
import type * as RecipientBehaviourContext from "./RecipientBehaviourContext.js"
import type * as ShardingError from "./ShardingError.js"

/**
 * An alias to a RecipientBehaviour
 * @since 1.0.0
 * @category models
 */
export interface RecipientBehaviour<R, Msg extends Message.AnyMessage> {
  (
    entityId: string
  ): Effect.Effect<
    R | RecipientBehaviourContext.RecipientBehaviourContext | Scope.Scope,
    never,
    <A extends Msg>(
      message: A
    ) => Effect.Effect<never, ShardingError.ShardingErrorMessageQueue, MessageState.MessageState<Message.Success<A>>>
  >
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
export const fromFunctionEffect: <R, Msg extends Message.AnyMessage>(
  handler: (entityId: string, message: Msg) => Effect.Effect<R, never, MessageState.MessageState<Message.Success<Msg>>>
) => RecipientBehaviour<R, Msg> = internal.fromFunctionEffect

/**
 * @since 1.0.0
 * @category utils
 */
export const fromInMemoryQueue: <R, Msg extends Message.AnyMessage>(
  handler: (
    entityId: string,
    dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>,
    reply: <A extends Msg>(msg: A, value: Message.Success<A>) => Effect.Effect<never, never, void>
  ) => Effect.Effect<R, never, void>
) => RecipientBehaviour<R, Msg> = internal.fromInMemoryQueue
