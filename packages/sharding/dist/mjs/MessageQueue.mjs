/**
 * @since 1.0.0
 */
import * as Effect from "@effect/io/Effect";
import * as Queue from "@effect/io/Queue";
/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/sharding/MessageQueueInstance";
/**
 * A layer that creates an in-memory message queue.
 *
 * @since 1.0.0
 * @category layers
 */
export const inMemory = () => Effect.gen(function* (_) {
  const queue = yield* _(Queue.unbounded());
  return {
    offer: msg => Queue.offer(queue, msg),
    dequeue: queue,
    shutdown: Queue.shutdown(queue)
  };
});
//# sourceMappingURL=MessageQueue.mjs.map