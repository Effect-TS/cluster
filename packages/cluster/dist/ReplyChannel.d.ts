/**
 * @since 1.0.0
 */
import type * as ShardingError from "@effect/cluster/ShardingError";
import type * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId = "@effect/cluster/ReplyChannel";
/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;
/**
 * @since 1.0.0
 * @category models
 */
export interface ReplyChannel<A> {
    /**
     * @since 1.0.0
     */
    readonly _id: TypeId;
    /**
     * @since 1.0.0
     */
    readonly await: Effect.Effect<never, never, void>;
    /**
     * @since 1.0.0
     */
    readonly fail: (cause: Cause.Cause<ShardingError.ShardingErrorEntityNotManagedByThisPod>) => Effect.Effect<never, never, void>;
    /**
     * @since 1.0.0
     */
    readonly reply: (value: A) => Effect.Effect<never, never, void>;
    /**
     * @since 1.0.0
     */
    readonly output: Effect.Effect<never, ShardingError.ShardingErrorEntityNotManagedByThisPod, Option.Option<A>>;
}
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isReplyChannel(value: unknown): value is ReplyChannel<any>;
//# sourceMappingURL=ReplyChannel.d.ts.map