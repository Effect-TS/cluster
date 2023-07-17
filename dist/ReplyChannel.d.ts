import type * as Cause from "@effect/io/Cause";
import * as Effect from "@effect/io/Effect";
import type { Throwable } from "@effect/shardcake/ShardError";
import * as Stream from "@effect/stream/Stream";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId = "@effect/shardcake/ReplyChannel";
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
    _id: TypeId;
    /**
     * @since 1.0.0
     */
    await: Effect.Effect<never, never, void>;
    /**
     * @since 1.0.0
     */
    end: Effect.Effect<never, never, void>;
    /**
     * @since 1.0.0
     */
    fail(cause: Cause.Cause<Throwable>): Effect.Effect<never, never, void>;
    /**
     * @since 1.0.0
     */
    replySingle(a: A): Effect.Effect<never, never, void>;
    /**
     * @since 1.0.0
     */
    replyStream(stream: Stream.Stream<never, Throwable, A>): Effect.Effect<never, never, void>;
}
//# sourceMappingURL=ReplyChannel.d.ts.map