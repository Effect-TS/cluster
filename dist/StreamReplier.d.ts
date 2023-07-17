/**
 * @since 1.0.0
 */
import * as Effect from "@effect/io/Effect";
import * as Schema from "@effect/schema/Schema";
import * as ReplyId from "@effect/shardcake/ReplyId";
import * as Sharding from "@effect/shardcake/Sharding";
import type * as Stream from "@effect/stream/Stream";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId = "@effect/shardcake/StreamReplier";
/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;
/**
 * @since 1.0.0
 * @category models
 */
export interface StreamReplier<R> {
    [TypeId]: {};
    id: ReplyId.ReplyId;
    schema: Schema.Schema<any, R>;
    reply: (reply: Stream.Stream<never, never, R>) => Effect.Effect<Sharding.Sharding, never, void>;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare const streamReplier: <R>(id: ReplyId.ReplyId, schema: Schema.Schema<any, R>) => StreamReplier<R>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const schema: <A>(schema: Schema.Schema<any, A>) => Schema.Schema<any, StreamReplier<A>>;
//# sourceMappingURL=StreamReplier.d.ts.map