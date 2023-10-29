/**
 * @since 1.0.0
 */
import * as Replier from "@effect/cluster/Replier";
import * as ReplyId from "@effect/cluster/ReplyId";
import * as Schema from "@effect/schema/Schema";
import * as Effect from "effect/Effect";
import type * as Types from "effect/Types";
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
 * A `MessageSchema<From, To, A>` is an augmented schema that provides utilities to build the Message<A> with a valid replier.
 *
 * @since 1.0.0
 * @category models
 */
export interface MessageSchema<From, To, A> extends Schema.Schema<From, Types.Simplify<To & Message<A>>> {
    make: (message: To, replyId: ReplyId.ReplyId) => Types.Simplify<To & Message<A>>;
    makeEffect: (message: To) => Effect.Effect<never, never, Types.Simplify<To & Message<A>>>;
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
export declare function schema<RI, RA>(replySchema: Schema.Schema<RI, RA>): <I extends object, A extends object>(item: Schema.Schema<I, A>) => MessageSchema<I, A, RA>;
//# sourceMappingURL=Message.d.ts.map