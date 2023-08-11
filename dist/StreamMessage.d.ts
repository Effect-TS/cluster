import * as Schema from "@effect/schema/Schema";
import type { JsonData } from "@effect/shardcake/JsonData";
import type * as ReplyId from "@effect/shardcake/ReplyId";
import * as StreamReplier from "@effect/shardcake/StreamReplier";
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
 * @since 1.0.0
 * @category utils
 */
export declare function isStreamMessage<A>(value: unknown): value is StreamMessage<A>;
/**
 * Creates both the schema and a constructor for a `Message<A>`
 *
 * @since 1.0.0
 * @category schema
 */
export declare function schema<RI extends JsonData, RA>(success: Schema.Schema<RI, RA>): <I extends JsonData, A extends object>(item: Schema.Schema<I, A>) => readonly [Schema.Schema<I, Schema.Spread<A & StreamMessage<RA>>>, (arg: A) => (replyId: ReplyId.ReplyId) => Schema.Spread<A & StreamMessage<RA>>];
//# sourceMappingURL=StreamMessage.d.ts.map