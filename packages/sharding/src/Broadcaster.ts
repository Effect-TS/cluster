/**
 * @since 1.0.0
 */
import type * as Either from "effect/Either"
import type * as HashMap from "effect/HashMap"
import type * as Effect from "effect/Effect"
import type * as Message from "@effect/sharding/Message"
import type * as PodAddress from "@effect/sharding/PodAddress"
import type * as ReplyId from "@effect/sharding/ReplyId"
import type * as ShardingError from "@effect/sharding/ShardingError"

/**
 * An interface to communicate with a remote broadcast receiver
 * @since 1.0.0
 * @category models
 */
export interface Broadcaster<Msg> {
  /**
   * Broadcast a message without waiting for a response (fire and forget)
   * @since 1.0.0
   */
  readonly broadcastDiscard: (topic: string) => (msg: Msg) => Effect.Effect<never, ShardingError.ShardingError, void>

  /**
   * Broadcast a message and wait for a response from each consumer
   * @since 1.0.0
   */
  readonly broadcast: (
    topic: string
  ) => <A extends Msg & Message.Message<any>>(
    msg: (replyId: ReplyId.ReplyId) => A
  ) => Effect.Effect<
    never,
    ShardingError.ShardingError,
    HashMap.HashMap<PodAddress.PodAddress, Either.Either<ShardingError.ShardingError, Message.Success<A>>>
  >
}
