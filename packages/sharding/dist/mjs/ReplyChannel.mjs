import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import { pipe } from "effect/Function";
import * as Queue from "effect/Queue";
import * as Stream from "effect/Stream";
import * as Take from "effect/Take";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/sharding/ReplyChannel";
/**
 * @since 1.0.0
 * @category utils
 */
export function isReplyChannel(value) {
  return typeof value === "object" && value !== null && "_id" in value && value["_id"] === TypeId;
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
    await: await_,
    end,
    fail,
    replySingle: a => pipe(Queue.offer(queue, Take.of(a)), Effect.exit, Effect.zipRight(end)),
    replyStream: stream => pipe(Stream.runForEach(stream, a => Queue.offer(queue, Take.of(a))), Effect.onExit(_ => Queue.offer(queue, Exit.match(_, {
      onFailure: e => Take.failCause(e),
      onSuccess: () => Take.end
    }))), Effect.race(await_), Effect.fork, Effect.asUnit),
    output: pipe(Stream.fromQueue(queue, {
      shutdown: true
    }), Stream.flattenTake, Stream.onError(fail))
  };
}
/** @internal */
export const stream = () => pipe(Queue.unbounded(), Effect.map(fromQueue));
//# sourceMappingURL=ReplyChannel.mjs.map