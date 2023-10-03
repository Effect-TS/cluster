/**
 * @since 1.0.0
 */
import type * as ShardingError from "@effect/sharding/ShardingError";
import type * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId = "@effect/sharding/ReplyChannel";
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
    readonly end: Effect.Effect<never, never, void>;
    /**
     * @since 1.0.0
     */
    readonly fail: (cause: Cause.Cause<ShardingError.ShardingError>) => Effect.Effect<never, never, void>;
    /**
     * @since 1.0.0
     */
    readonly replySingle: (a: A) => Effect.Effect<never, never, void>;
    /**
     * @since 1.0.0
     */
    readonly replyStream: (stream: Stream.Stream<never, ShardingError.ShardingError, A>) => Effect.Effect<never, never, void>;
    /**
     * @since 1.0.0
     */
    readonly output: Stream.Stream<never, ShardingError.ShardingError, A>;
}
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isReplyChannel(value: unknown): value is ReplyChannel<any>;
//# sourceMappingURL=ReplyChannel.d.ts.map