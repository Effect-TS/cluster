/**
 * A module that provides utilities to build basic behaviours
 * @since 1.0.0
 */
import type * as Message from "@effect/cluster/Message"
import type * as Duration from "effect/Duration"
import type * as Effect from "effect/Effect"
import type * as Option from "effect/Option"
import type * as Queue from "effect/Queue"
import type * as Ref from "effect/Ref"
import type * as Scope from "effect/Scope"
import * as internal from "./internal/recipientBehaviour.js"
import type * as MessageState from "./MessageState.js"
import type * as PoisonPill from "./PoisonPill.js"
import type * as RecipientBehaviourContext from "./RecipientBehaviourContext.js"
import type * as ShardingException from "./ShardingException.js"

/**
 * An alias to a RecipientBehaviour
 * @since 1.0.0
 * @category models
 */
export interface RecipientBehaviour<Msg, R> extends
  Effect.Effect<
    <A extends Msg>(
      message: A
    ) => Effect.Effect<
      MessageState.MessageState<Message.Message.Exit<A>>,
      ShardingException.ExceptionWhileOfferingMessageException
    >,
    never,
    R | RecipientBehaviourContext.RecipientBehaviourContext | Scope.Scope
  >
{}

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
export const fromFunctionEffect: <Msg extends Message.Message.Any, R>(
  handler: (
    entityId: string,
    message: Msg
  ) => Effect.Effect<MessageState.MessageState<Message.Message.Exit<Msg>>, never, R>
) => RecipientBehaviour<Msg, R> = internal.fromFunctionEffect

/**
 * @since 1.0.0
 * @category utils
 */
export const fromFunctionEffectStateful: <S, R, Msg extends Message.Message.Any, R2>(
  initialState: (entityId: string) => Effect.Effect<S, never, R>,
  handler: (
    entityId: string,
    message: Msg,
    stateRef: Ref.Ref<S>
  ) => Effect.Effect<MessageState.MessageState<Message.Message.Exit<Msg>>, never, R2>
) => RecipientBehaviour<Msg, R | R2> = internal.fromFunctionEffectStateful

/**
 * @since 1.0.0
 * @category utils
 */
export const fromInMemoryQueue: <Msg extends Message.Message.Any, R>(
  handler: (
    entityId: string,
    dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>,
    processed: <A extends Msg>(
      message: A,
      value: Option.Option<Message.Message.Exit<A>>
    ) => Effect.Effect<void, never, never>
  ) => Effect.Effect<void, never, R>
) => RecipientBehaviour<Msg, R> = internal.fromInMemoryQueue
