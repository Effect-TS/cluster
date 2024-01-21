/**
 * @since 1.0.0
 */
import type * as Message from "@effect/cluster/Message"
import type * as Effect from "effect/Effect"
import type * as ShardingError from "./ShardingError.js"

/**
 * An interface to communicate with a remote entity
 * @tparam Msg the type of message that can be sent to this entity type
 * @since 1.0.0
 * @category models
 */
export interface Messenger<Msg> {
  /**
   * Send a message without waiting for a response (fire and forget)
   * @since 1.0.0
   */
  sendDiscard(entityId: string): (message: Msg) => Effect.Effect<never, ShardingError.ShardingError, void>

  /**
   * Send a message and wait for a response of type `Res`
   * @since 1.0.0
   */
  send(
    entityId: string
  ): <A extends Msg & Message.MessageWithResult.Any>(
    message: A
  ) => Effect.Effect<
    never,
    ShardingError.ShardingError | Message.MessageWithResult.Error<A>,
    Message.MessageWithResult.Success<A>
  >
}
