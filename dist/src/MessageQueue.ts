/**
 * @since 1.0.0
 */
import * as Effect from "@effect/io/Effect"
import * as Queue from "@effect/io/Queue"
import type * as PoisonPill from "@effect/sharding/PoisonPill"
import type * as ShardingError from "@effect/sharding/ShardingError"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/sharding/MessageQueueInstance"

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface MessageQueue<Msg> {
  readonly dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>
  readonly offer: (
    msg: Msg | PoisonPill.PoisonPill
  ) => Effect.Effect<never, ShardingError.ShardingMessageQueueError, void>
  readonly shutdown: Effect.Effect<never, never, void>
}

/**
 * @since 1.0.0
 * @category models
 */
export type MessageQueueConstructor<R, Msg> = (
  entityId: string
) => Effect.Effect<R, never, MessageQueue<Msg>>

/**
 * A layer that creates an in-memory message queue.
 *
 * @since 1.0.0
 * @category layers
 */
export const inMemory: MessageQueueConstructor<never, any> = () =>
  Effect.gen(function*(_) {
    const queue = yield* _(Queue.unbounded<any>())
    return ({
      offer: (msg: unknown) => Queue.offer(queue, msg),
      dequeue: queue,
      shutdown: Queue.shutdown(queue)
    })
  })
