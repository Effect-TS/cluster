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
    <A extends Msg>(
      message: A
    ) => Effect.Effect<
      never,
      ShardingError.ShardingErrorWhileOfferingMessage,
      MessageState.MessageState<Message.MessageWithResult.Exit<A>>
    >
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
export const fromFunctionEffect: <R, Msg>(
  handler: (
    entityId: string,
    message: Msg
  ) => Effect.Effect<R, never, MessageState.MessageState<Message.MessageWithResult.Exit<Msg>>>
) => RecipientBehaviour<R, Msg> = internal.fromFunctionEffect

/**
 * @since 1.0.0
 * @category utils
 */
export const fromFunctionEffectStateful: <R, S, R2, Msg>(
  initialState: (entityId: string) => Effect.Effect<R, never, S>,
  handler: (
    entityId: string,
    message: Msg,
    stateRef: Ref.Ref<S>
  ) => Effect.Effect<R2, never, MessageState.MessageState<Message.MessageWithResult.Exit<Msg>>>
) => RecipientBehaviour<R | R2, Msg> = internal.fromFunctionEffectStateful

/**
 * @since 1.0.0
 * @category utils
 */
export const fromInMemoryQueue: <R, Msg>(
  handler: (
    entityId: string,
    dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>,
    processed: <A extends Msg>(
      message: A,
      value: Option.Option<Message.MessageWithResult.Exit<A>>
    ) => Effect.Effect<never, never, void>
  ) => Effect.Effect<R, never, void>
) => RecipientBehaviour<R, Msg> = internal.fromInMemoryQueue
