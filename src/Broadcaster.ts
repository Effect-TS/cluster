import type * as HashMap from "@effect/data/HashMap"
import type * as Effect from "@effect/io/Effect"
import type * as PodAddress from "@effect/shardcake/PodAddress"
import type * as Replier from "@effect/shardcake/Replier"
import type * as ShardError from "@effect/shardcake/ShardError"
/**
 * An interface to communicate with a remote broadcast receiver
 * @tparam Msg the type of message that can be sent to this broadcast receiver
 */
export interface Broadcaster<Msg> {
  /**
   * Broadcast a message without waiting for a response (fire and forget)
   */
  broadcastDiscard(topic: string): (msg: Msg) => Effect.Effect<never, never, void>

  /**
   * Broadcast a message and wait for a response from each consumer
   */
  broadcast<Res>(
    topic: string
  ): (
    msg: (replier: Replier.Replier<Res>) => Msg
  ) => Effect.Effect<
    never,
    never,
    HashMap.HashMap<PodAddress.PodAddress, Effect.Effect<never, ShardError.ReplyFailure, Res>>
  >
}
