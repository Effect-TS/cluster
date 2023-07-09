/**
 * @since 1.0.0
 */
import type * as Effect from "@effect/io/Effect"
import type * as Message from "@effect/shardcake/Message"
import type * as ReplyId from "@effect/shardcake/ReplyId"
import type { Throwable } from "@effect/shardcake/ShardError"
import type * as StreamMessage from "@effect/shardcake/StreamMessage"
import type * as Stream from "@effect/stream/Stream"

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
  sendDiscard(entityId: string): (msg: Msg) => Effect.Effect<never, Throwable, void>

  /**
   * Send a message and wait for a response of type `Res`
   * @since 1.0.0
   */
  send(
    entityId: string
  ): <A extends Msg & Message.Message<any>>(
    msg: (replyId: ReplyId.ReplyId) => A
  ) => Effect.Effect<never, Throwable, Message.Success<A>>

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
  ) => Effect.Effect<never, Throwable, Stream.Stream<never, Throwable, StreamMessage.Success<A>>>

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
  /*
  sendStreamAutoRestart<Cursor>(
    entityId: string,
    cursor: Cursor
  ): <A extends Msg & Message.Message<any>>(
    msg: (cursor: Cursor) => (replyId: ReplyId.ReplyId) => A
  ) => (
    updateCursor: (cursor: Cursor, res: Message.Success<A>) => Cursor
  ) => Effect.Effect<never, Throwable, Stream.Stream<never, Throwable, Message.Success<A>>>*/
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
): <A extends Msg & Message.Message<any>>(
  msg: (cursor: Cursor) => (replyId: ReplyId.ReplyId) => A
) => (
  updateCursor: (cursor: Cursor, res: Message.Success<A>) => Cursor
) => Effect.Effect<never, Throwable, Stream.Stream<never, Throwable, Message.Success<A>>> {
  return (fn) =>
    (updateCursor) => {
      return messenger + entityId + cursor + fn + updateCursor as any
    }
}
/*
TODO(update)
def sendStreamAutoRestart[Cursor, Res](entityId: String, cursor: Cursor)(msg: (Cursor, StreamReplier[Res]) => Msg)(
  updateCursor: (Cursor, Res) => Cursor
): ZStream[Any, Throwable, Res] =
  ZStream
    .unwrap(sendStream[Res](entityId)(msg(cursor, _)))
    .either
    .mapAccum(cursor) {
      case (c, Right(res)) => updateCursor(c, res) -> Right(res)
      case (c, Left(err))  => (c, Left(c -> err))
    }
    .flatMap {
      case Right(res)                                => ZStream.succeed(res)
      case Left((lastSeenCursor, PodUnavailable(_))) =>
        ZStream.execute(ZIO.sleep(200.millis)) ++
          sendStreamAutoRestart(entityId, lastSeenCursor)(msg)(updateCursor)
      case Left((_, err))                            => ZStream.fail(err)
    }
*/
