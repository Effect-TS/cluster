/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as ReplyId from "@effect/sharding/ReplyId";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId = "@effect/sharding/StreamReplier";
/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;
/**
 * @since 1.0.0
 * @category models
 */
export interface StreamReplier<A> {
    _id: TypeId;
    id: ReplyId.ReplyId;
    schema: Schema.Schema<unknown, A>;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare const streamReplier: <I, A>(id: ReplyId.ReplyId, schema: Schema.Schema<I, A>) => StreamReplier<A>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const schema: <I, A>(schema: Schema.Schema<I, A>) => Schema.Schema<I, StreamReplier<A>>;
//# sourceMappingURL=StreamReplier.d.ts.map