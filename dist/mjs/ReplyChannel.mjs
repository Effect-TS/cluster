/**
 * @since 1.0.0
 */

import * as Option from "@effect/data/Option";
import * as Deferred from "@effect/io/Deferred";
import * as Effect from "@effect/io/Effect";
import * as Exit from "@effect/io/Exit";
import * as Queue from "@effect/io/Queue";
import * as Stream from "@effect/stream/Stream";
import * as Take from "@effect/stream/Take";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/shardcake/ReplyChannel";
/** @internal */
export function isReplyChannel(value) {
  return typeof value === "object" && value !== null && "_id" in value && value["_id"] === TypeId;
}
/** @internal */
export function isReplyChannelFromQueue(value) {
  return isReplyChannel(value) && "_tag" in value && value["_tag"] === "FromQueue";
}
/** @internal */
export function isReplyChannelFromDeferred(value) {
  return isReplyChannel(value) && "_tag" in value && value["_tag"] === "FromDeferred";
}
/**
 * Construct a new `ReplyChannel` from a queue.
 *
 * @internal
 */
export function fromQueue(queue) {
  const end = Effect.asUnit(Effect.exit(Queue.offer(queue, Take.end)));
  const fail = cause => Effect.asUnit(Effect.exit(Queue.offer(queue, Take.failCause(cause))));
  const await_ = Queue.awaitShutdown(queue);
  return {
    _id: TypeId,
    _tag: "FromQueue",
    await: await_,
    end,
    fail,
    replySingle: a => Effect.zipRight(end)(Effect.exit(Queue.offer(queue, Take.of(a)))),
    replyStream: stream => Effect.asUnit(Effect.fork(Effect.race(await_)(Effect.onExit(_ => Queue.offer(queue, Exit.match(_, {
      onFailure: e => Take.failCause(e),
      onSuccess: () => Take.end
    })))(Stream.runForEach(stream, a => Queue.offer(queue, Take.of(a))))))),
    output: Stream.onError(fail)(Stream.flattenTake(Stream.fromQueueWithShutdown(queue)))
  };
}
/**
 * Construct a new `ReplyChannel` from a deferred.
 *
 * @internal
 */
export function fromDeferred(deferred) {
  const end = Effect.asUnit(Deferred.succeed(deferred, Option.none()));
  const fail = cause => Effect.asUnit(Deferred.failCause(deferred, cause));
  return {
    _id: TypeId,
    _tag: "FromDeferred",
    await: Effect.asUnit(Effect.exit(Deferred.await(deferred))),
    end,
    fail,
    replySingle: a => Effect.asUnit(Deferred.succeed(deferred, Option.some(a))),
    replyStream: stream => Effect.asUnit(Effect.fork(Effect.catchAllCause(fail)(Effect.flatMap(_ => Deferred.succeed(deferred, _))(Stream.runHead(stream))))),
    output: Effect.onError(fail)(Deferred.await(deferred))
  };
}
/** @internal */
export const single = () => Effect.map(fromDeferred)(Deferred.make());
/** @internal */
export const stream = () => Effect.map(fromQueue)(Queue.unbounded());
//# sourceMappingURL=ReplyChannel.mjs.map