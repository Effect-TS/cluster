/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as Queue from "@effect/io/Queue";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/shardcake/MessageQueueInstance";
/**
 * @since 1.0.0
 * @category context
 */
export const MessageQueue = /*#__PURE__*/Tag();
/**
 * A layer that creates an in-memory message queue.
 *
 * @since 1.0.0
 * @category layers
 */
export const inMemory = /*#__PURE__*/Layer.succeed(MessageQueue, {
  _id: TypeId,
  make: () => Effect.gen(function* (_) {
    const queue = yield* _(Queue.unbounded());
    yield* _(Effect.addFinalizer(() => Queue.shutdown(queue)));
    return {
      offer: msg => Queue.offer(queue, msg),
      dequeue: queue
    };
  })
});
//# sourceMappingURL=MessageQueue.mjs.map