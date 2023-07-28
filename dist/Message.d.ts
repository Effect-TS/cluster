import * as Schema from "@effect/schema/Schema";
import * as Replier from "@effect/shardcake/Replier";
import type * as ReplyId from "@effect/shardcake/ReplyId";
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
export interface Message<A> {
    readonly replier: Replier.Replier<A>;
}
/**
 * Extracts the success type from a `Message<A>`.
 *
 * @since 1.0.0
 * @category utils
 */
export type Success<A> = A extends Message<infer X> ? X : never;
/**
 * Creates both the schema and a constructor for a `Message<A>`
 *
 * @since 1.0.0
 * @category schema
 */
export declare function schema<RI extends JsonData, RA>(replySchema: Schema.Schema<RI, RA>): <I extends JsonData, A extends object>(item: Schema.Schema<I, A>) => readonly [Schema.Schema<I, Schema.Spread<A & Message<RA>>>, (arg: A) => (replyId: ReplyId.ReplyId) => Schema.Spread<A & Message<RA>>];
//# sourceMappingURL=Message.d.ts.map