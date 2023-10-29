/**
 * @since 1.0.0
 */
import type * as MessageQueue from "@effect/cluster/MessageQueue";
import type * as ReplyChannel from "@effect/cluster/ReplyChannel";
import type * as ReplyId from "@effect/cluster/ReplyId";
import type * as Fiber from "effect/Fiber";
import type * as HashMap from "effect/HashMap";
import * as Option from "effect/Option";
import type * as RefSynchronized from "effect/SynchronizedRef";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId: unique symbol;
/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;
/**
 * @since 1.0.0
 * @category models
 */
export interface EntityState<Req> {
    readonly _id: TypeId;
    readonly messageQueue: Option.Option<MessageQueue.MessageQueue<Req>>;
    readonly replyChannels: RefSynchronized.SynchronizedRef<HashMap.HashMap<ReplyId.ReplyId, ReplyChannel.ReplyChannel<any>>>;
    readonly expirationFiber: Fiber.RuntimeFiber<never, void>;
    readonly executionFiber: Fiber.RuntimeFiber<never, void>;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function make<Req>(data: Omit<EntityState<Req>, "_id">): EntityState<Req>;
/**
 * @since 1.0.0
 * @category modifiers
 */
export declare function withoutMessageQueue<Req>(entityState: EntityState<Req>): EntityState<Req>;
/**
 * @since 1.0.0
 * @category modifiers
 */
export declare function withExpirationFiber(expirationFiber: Fiber.RuntimeFiber<never, void>): <Req>(entityState: EntityState<Req>) => EntityState<Req>;
//# sourceMappingURL=EntityState.d.ts.map