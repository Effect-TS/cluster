/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as Replier from "@effect/sharding/Replier";
import type * as ReplyId from "@effect/sharding/ReplyId";
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
 * @since 1.0.0
 * @category utils
 */
export declare function isMessage<R>(value: unknown): value is Message<R>;
/**
 * Creates both the schema and a constructor for a `Message<A>`
 *
 * @since 1.0.0
 * @category schema
 */
export declare function schema<RI, RA>(replySchema: Schema.Schema<RI, RA>): <I, A extends object>(item: Schema.Schema<I, A>) => readonly [Schema.Schema<I, A & Message<RA>>, (arg: A) => (replyId: ReplyId.ReplyId) => A & Message<RA>];
//# sourceMappingURL=Message.d.ts.map