/**
 * @since 1.0.0
 */
import * as Effect from "@effect/io/Effect";
import * as Schema from "@effect/schema/Schema";
import type { JsonData } from "@effect/shardcake/JsonData";
import * as ReplyId from "@effect/shardcake/ReplyId";
import * as Sharding from "@effect/shardcake/Sharding";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId = "@effect/shardcake/Replier";
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
    [TypeId]: {};
    id: ReplyId.ReplyId;
    schema: Schema.Schema<JsonData, A>;
    reply: (reply: A) => Effect.Effect<Sharding.Sharding, never, void>;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare const replier: <I extends JsonData, A>(id: ReplyId.ReplyId, schema: Schema.Schema<I, A>) => Replier<A>;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isReplier<A>(value: unknown): value is Replier<A>;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const schema: <I extends JsonData, A>(schema: Schema.Schema<I, A>) => Schema.Schema<I, Replier<A>>;
//# sourceMappingURL=Replier.d.ts.map