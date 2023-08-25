/**
 * @since 1.0.0
 */
import * as Effect from "@effect/io/Effect";
import * as Schema from "@effect/schema/Schema";
import * as ReplyId from "@effect/sharding/ReplyId";
import * as Sharding from "@effect/sharding/Sharding";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId = "@effect/sharding/Replier";
/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;
/**
 * @since 1.0.0
 * @category models
 */
export interface Replier<A> {
    readonly _id: TypeId;
    readonly id: ReplyId.ReplyId;
    readonly schema: Schema.Schema<unknown, A>;
    readonly reply: (reply: A) => Effect.Effect<Sharding.Sharding, never, void>;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare const replier: <I, A>(id: ReplyId.ReplyId, schema: Schema.Schema<I, A>) => Replier<A>;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isReplier<A>(value: unknown): value is Replier<A>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const schema: <I, A>(schema: Schema.Schema<I, A>) => Schema.Schema<I, Replier<A>>;
//# sourceMappingURL=Replier.d.ts.map