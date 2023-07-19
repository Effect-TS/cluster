/**
 * @since 1.0.0
 */
import * as Duration from "@effect/data/Duration";
import * as Either from "@effect/data/Either";
import { pipe } from "@effect/data/Function";
import * as Effect from "@effect/io/Effect";
import { isPodUnavailableError } from "@effect/shardcake/ShardError";
import * as Stream from "@effect/stream/Stream";
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
export function sendStreamAutoRestart(messenger, entityId, cursor) {
  return fn => updateCursor => {
    return pipe(Stream.unwrap(messenger.sendStream(entityId)(fn(cursor))), Stream.either, Stream.mapAccum(cursor, (c, either) => Either.match(either, {
      onLeft: err => [c, Either.left([c, err])],
      onRight: res => [updateCursor(c, res), Either.right(res)]
    })), Stream.flatMap(Either.match({
      onRight: res => Stream.succeed(res),
      onLeft: ([cursor, err]) => isPodUnavailableError(err) ? pipe(Effect.sleep(Duration.millis(200)), Stream.fromEffect, Stream.zipRight(sendStreamAutoRestart(messenger, entityId, cursor)(fn)(updateCursor))) : Stream.fail(err)
    })));
  };
}
//# sourceMappingURL=Messenger.mjs.map