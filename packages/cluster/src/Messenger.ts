/**
 * @since 1.0.0
 */
import type * as Effect from "effect/Effect"
import type * as Message from "./Message.js"
import type * as ShardingError from "./ShardingError.js"

/**
 * An interface to communicate with a remote entity
 * @tparam Msg the type of message that can be sent to this entity type
 * @since 1.0.0
 * @category models
 */
export interface Messenger<Msg extends Message.Any> {
  /**
   * Send a message without waiting for a response (fire and forget)
   * @since 1.0.0
   */
  sendDiscard(entityId: string): (message: Msg) => Effect.Effect<never, ShardingError.ShardingError, void>

  /**
   * Builds and sends a message without waiting for a response (fire and forget)
   * NOTE: This variant is considered unsafe since it creates the messageId before sending the message.
   * This means that if the message is sent, received remotely, but acknowledgmenent fails to be sent back
   * before the configured sendTimeout, if the effect is re-executed you'll end up sending multiple times the same Message.
   * @since 1.0.0
   */
  unsafeSendDiscard(
    entityId: string
  ): (message: Message.Payload<Msg>) => Effect.Effect<never, ShardingError.ShardingError, void>

  /**
   * Send a message and wait for a response of type `Res`
   * @since 1.0.0
   */
  send(
    entityId: string
  ): <A extends Msg & Message.AnyWithResult>(
    message: A
  ) => Effect.Effect<never, ShardingError.ShardingError | Message.Failure<A>, Message.Success<A>>
}
