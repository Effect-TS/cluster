/**
 * @since 1.0.0
 */
import * as Duration from "effect/Duration"
import * as Either from "effect/Either"
import { pipe } from "effect/Function"
import * as Effect from "effect/Effect"
import type * as Message from "@effect/sharding/Message"
import type * as ReplyId from "@effect/sharding/ReplyId"
import * as ShardingError from "@effect/sharding/ShardingError"
import type * as StreamMessage from "@effect/sharding/StreamMessage"
import * as Stream from "effect/Stream"

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
  sendDiscard(entityId: string): (msg: Msg) => Effect.Effect<never, ShardingError.ShardingError, void>

  /**
   * Send a message and wait for a response of type `Res`
   * @since 1.0.0
   */
  send(
    entityId: string
  ): <A extends Msg & Message.Message<any>>(
    msg: (replyId: ReplyId.ReplyId) => A
  ) => Effect.Effect<never, ShardingError.ShardingError, Message.Success<A>>

  /**
   * Send a message and receive a stream of responses of type `Res`.
   *
   * Note: The returned stream will fail with a `PodUnavailable` error if the remote entity is rebalanced while
   * streaming responses. See `sendStreamAutoRestart` for an alternative that will automatically restart the stream
   * in case of rebalance.
   * @since 1.0.0
   */
  sendStream(
    entityId: string
  ): <A extends Msg & StreamMessage.StreamMessage<any>>(
    fn: (replyId: ReplyId.ReplyId) => A
  ) => Effect.Effect<
    never,
    ShardingError.ShardingError,
    Stream.Stream<never, ShardingError.ShardingError, StreamMessage.Success<A>>
  >
}

/**
 * Send a message and receive a stream of responses of type `Res` while restarting the stream when the remote entity
 * is rebalanced.
 *
 * To do so, we need a "cursor" so the stream of responses can be restarted where it ended before the rebalance. That
 * is, the first message sent to the remote entity contains the given initial cursor value and we extract an updated
 * cursor from the responses so that when the remote entity is rebalanced, a new message can be sent with the right
 * cursor according to what we've seen in the previous stream of responses.
 * @since 1.0.0
 */
export function sendStreamAutoRestart<Msg, Cursor>(
  messenger: Messenger<Msg>,
  entityId: string,
  cursor: Cursor
) {
  return <A extends Msg & StreamMessage.StreamMessage<any>>(fn: (cursor: Cursor) => (replyId: ReplyId.ReplyId) => A) =>
  (
    updateCursor: (cursor: Cursor, res: StreamMessage.Success<A>) => Cursor
  ): Stream.Stream<never, ShardingError.ShardingError, StreamMessage.Success<A>> => {
    return pipe(
      Stream.unwrap(
        messenger.sendStream(entityId)(fn(cursor))
      ),
      Stream.either,
      Stream.mapAccum(cursor, (c, either) =>
        Either.match(either, {
          onLeft: (
            err
          ) => [
            c,
            Either.left([c, err]) as Either.Either<[Cursor, ShardingError.ShardingError], StreamMessage.Success<A>>
          ],
          onRight: (res) =>
            [
              updateCursor(c, res),
              Either.right(res) as Either.Either<[Cursor, ShardingError.ShardingError], StreamMessage.Success<A>>
            ] as const
        })),
      Stream.flatMap(Either.match({
        onRight: (res) => Stream.succeed(res),
        onLeft: ([cursor, err]) =>
          ShardingError.isShardingErrorPodUnavailable(err) ?
            pipe(
              Effect.sleep(Duration.millis(200)),
              Stream.fromEffect,
              Stream.zipRight(sendStreamAutoRestart(messenger, entityId, cursor)(fn)(updateCursor))
            ) :
            Stream.fail(err)
      }))
    )
  }
}
