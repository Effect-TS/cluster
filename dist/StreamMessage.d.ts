import * as Schema from "@effect/schema/Schema";
import type * as ReplyId from "@effect/shardcake/ReplyId";
import * as StreamReplier from "@effect/shardcake/StreamReplier";
import type { JsonData } from "@effect/shardcake/utils";
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
 * A `Message<A>` is a request from a data source for a value of type `A`
 *
 * @since 1.0.0
 * @category models
 */
export interface StreamMessage<A> {
    readonly replier: StreamReplier.StreamReplier<A>;
}
/**
 * Extracts the success type from a `Message<A>`.
 *
 * @since 1.0.0
 * @category utils
 */
export type Success<A> = A extends StreamMessage<infer X> ? X : never;
/**
 * Creates both the schema and a constructor for a `Message<A>`
 *
 * @since 1.0.0
 * @category schema
 */
export declare function schema<I2 extends JsonData, A>(success: Schema.Schema<I2, A>): <I1 extends JsonData, I extends object>(item: Schema.Schema<I1, I>) => readonly [Schema.Schema<I1, Schema.Spread<I & StreamMessage<A>>>, (arg: I) => (replyId: ReplyId.ReplyId) => Schema.Spread<I & StreamMessage<A>>];
//# sourceMappingURL=StreamMessage.d.ts.map