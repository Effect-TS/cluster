/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Effect from "@effect/io/Effect";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId = "@effect/shardcake/ReplyId";
/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;
/**
 * @since 1.0.0
 * @category models
 */
export interface ReplyId extends Schema.To<typeof schema> {
}
/**
 * Construct a new `ReplyId` from its internal id string value.
 *
 * @since 1.0.0
 * @category constructors
 */
export declare function make(value: string): ReplyId;
/**
 * Construct a new `ReplyId` by internally building a UUID.
 *
 * @since 1.0.0
 * @category constructors
 */
export declare const makeEffect: Effect.Effect<never, never, ReplyId>;
/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export declare const schema: Schema.Schema<{
    readonly _id: "@effect/shardcake/ReplyId";
    readonly value: string;
}, Data.Data<{
    readonly _id: "@effect/shardcake/ReplyId";
    readonly value: string;
}>>;
//# sourceMappingURL=ReplyId.d.ts.map