/**
 * @since 1.0.0
 */
import type * as Message from "@effect/cluster/Message"
import type * as Effect from "effect/Effect"
import type * as ShardingException from "./ShardingException.js"

/**
 * An interface to communicate with a remote entity.
 *
 * @tparam Msg the type of message that can be sent to this entity type
 * @since 1.0.0
 * @category models
 */
export interface Messenger<Msg extends Message.Message.Any> {
  /**
   * Send a message without waiting for a response (fire and forget)
   * Remember that due to network being unreliable, the messenger may attempt to send multiple times the same message.
   * The sendTimeout is exactly there to prevent indefinite sending of messages.
   *
   * @since 1.0.0
   */
  sendDiscard(entityId: string): (message: Msg) => Effect.Effect<void, ShardingException.ShardingException>

  /**
   * Send a message and wait for a response.
   * Remember that due to network being unreliable, the messenger may attempt to send multiple times the same message.
   * The sendTimeout is exactly there to prevent indefinite sending of messages.
   *
   * @since 1.0.0
   */
  send(
    entityId: string
  ): <A extends Msg>(
    message: A
  ) => Effect.Effect<
    Message.Message.Success<A>,
    ShardingException.ShardingException | Message.Message.Error<A>
  >
}
