/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import * as Queue from "@effect/io/Queue"
import type * as Scope from "@effect/io/Scope"
import type * as PoisonPill from "@effect/shardcake/PoisonPill"
import type * as RecipientType from "@effect/shardcake/RecipientType"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/shardcake/MessageQueueInstance"

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface MessageQueueInstance<Msg> {
  readonly dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>
  readonly offer: (msg: Msg | PoisonPill.PoisonPill) => Effect.Effect<never, never, void>
}

/**
 * @since 1.0.0
 * @category models
 */
export interface MessageQueue {
  readonly _id: TypeId
  readonly make: <Msg>(
    recipientType: RecipientType.RecipientType<Msg>,
    entityId: string
  ) => Effect.Effect<Scope.Scope, never, MessageQueueInstance<Msg>>
}

/**
 * @since 1.0.0
 * @category context
 */
export const MessageQueue = Tag<MessageQueue>()

/**
 * A layer that creates an in-memory message queue.
 *
 * @since 1.0.0
 * @category layers
 */
export const inMemory = Layer.succeed(MessageQueue, {
  _id: TypeId,
  make: () =>
    Effect.gen(function*(_) {
      const queue = yield* _(Queue.unbounded<any>())
      yield* _(Effect.addFinalizer(() => Queue.shutdown(queue)))
      return ({
        offer: (msg) => Queue.offer(queue, msg),
        dequeue: queue
      })
    })
})
