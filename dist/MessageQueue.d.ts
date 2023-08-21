/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as Queue from "@effect/io/Queue";
import type * as Scope from "@effect/io/Scope";
import type * as PoisonPill from "@effect/shardcake/PoisonPill";
import type * as RecipientType from "@effect/shardcake/RecipientType";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId = "@effect/shardcake/MessageQueueInstance";
/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;
/**
 * @since 1.0.0
 * @category models
 */
export interface MessageQueueInstance<Msg> {
    readonly dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>;
    readonly offer: (msg: Msg | PoisonPill.PoisonPill) => Effect.Effect<never, never, void>;
}
/**
 * @since 1.0.0
 * @category models
 */
export interface MessageQueue {
    readonly _id: TypeId;
    readonly make: <Msg>(recipientType: RecipientType.RecipientType<Msg>, entityId: string) => Effect.Effect<Scope.Scope, never, MessageQueueInstance<Msg>>;
}
/**
 * @since 1.0.0
 * @category context
 */
export declare const MessageQueue: Tag<MessageQueue, MessageQueue>;
/**
 * A layer that creates an in-memory message queue.
 *
 * @since 1.0.0
 * @category layers
 */
export declare const inMemory: Layer.Layer<never, never, MessageQueue>;
//# sourceMappingURL=MessageQueue.d.ts.map