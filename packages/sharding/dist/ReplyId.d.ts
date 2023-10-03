/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId = "@effect/sharding/ReplyId";
/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;
/**
 * @since 1.0.0
 * @category models
 */
export interface ReplyId extends Schema.Schema.To<typeof schema> {
}
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isReplyId(value: unknown): value is ReplyId;
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
    readonly _id: "@effect/sharding/ReplyId";
    readonly value: string;
}, Data.Data<{
    readonly _id: "@effect/sharding/ReplyId";
    readonly value: string;
}>>;
//# sourceMappingURL=ReplyId.d.ts.map