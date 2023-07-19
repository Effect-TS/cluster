/**
 * @since 1.0.0
 */
import { pipe } from "@effect/data/Function";
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
  const end = pipe(Queue.offer(queue, Take.end), Effect.exit, Effect.asUnit);
  const fail = cause => pipe(Queue.offer(queue, Take.failCause(cause)), Effect.exit, Effect.asUnit);
  const await_ = Queue.awaitShutdown(queue);
  return {
    _id: TypeId,
    _tag: "FromQueue",
    await: await_,
    end,
    fail,
    replySingle: a => pipe(Queue.offer(queue, Take.of(a)), Effect.exit, Effect.zipRight(end)),
    replyStream: stream => pipe(Stream.runForEach(stream, a => Queue.offer(queue, Take.of(a))), Effect.onExit(_ => Queue.offer(queue, Exit.match(_, {
      onFailure: e => Take.failCause(e),
      onSuccess: () => Take.end
    }))), Effect.race(await_), Effect.fork, Effect.asUnit),
    output: pipe(Stream.fromQueueWithShutdown(queue), Stream.flattenTake, Stream.onError(fail))
  };
}
/**
 * Construct a new `ReplyChannel` from a deferred.
 *
 * @internal
 */
export function fromDeferred(deferred) {
  const end = pipe(Deferred.succeed(deferred, Option.none()), Effect.asUnit);
  const fail = cause => pipe(Deferred.failCause(deferred, cause), Effect.asUnit);
  return {
    _id: TypeId,
    _tag: "FromDeferred",
    await: pipe(Deferred.await(deferred), Effect.exit, Effect.asUnit),
    end,
    fail,
    replySingle: a => pipe(Deferred.succeed(deferred, Option.some(a)), Effect.asUnit),
    replyStream: stream => pipe(Stream.runHead(stream), Effect.flatMap(_ => Deferred.succeed(deferred, _)), Effect.catchAllCause(fail), Effect.fork, Effect.asUnit),
    output: pipe(Deferred.await(deferred), Effect.onError(fail))
  };
}
/** @internal */
export const single = () => pipe(Deferred.make(), Effect.map(fromDeferred));
/** @internal */
export const stream = () => pipe(Queue.unbounded(), Effect.map(fromQueue));
//# sourceMappingURL=ReplyChannel.mjs.map