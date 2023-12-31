/**
 * @since 1.0.0
 */
import type * as Effect from "effect/Effect"
import type * as Either from "effect/Either"
import type * as HashMap from "effect/HashMap"
import type * as Message from "./Message.js"
import type * as PodAddress from "./PodAddress.js"
import type * as ShardingError from "./ShardingError.js"

/**
 * An interface to communicate with a remote broadcast receiver
 * @since 1.0.0
 * @category models
 */
export interface Broadcaster<Msg extends Message.Any> {
  /**
   * Broadcast a message without waiting for a response (fire and forget)
   * @since 1.0.0
   */
  readonly broadcastDiscard: (
    topicId: string
  ) => (message: Msg) => Effect.Effect<never, ShardingError.ShardingError, void>

  /**
   * Broadcast a message and wait for a response from each consumer
   * @since 1.0.0
   */
  readonly broadcast: (
    topicId: string
  ) => <A extends Msg & Message.AnyWithResult>(
    message: A
  ) => Effect.Effect<
    never,
    ShardingError.ShardingError,
    HashMap.HashMap<
      PodAddress.PodAddress,
      Either.Either<ShardingError.ShardingError | Message.Failure<A>, Message.Success<A>>
    >
  >
}
