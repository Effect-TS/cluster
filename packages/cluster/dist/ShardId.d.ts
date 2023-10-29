/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as Data from "effect/Data";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId = "@effect/cluster/ShardId";
/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardId extends Schema.Schema.To<typeof schema> {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function make(value: number): ShardId;
/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export declare const schema: Schema.Schema<{
    readonly _id: "@effect/cluster/ShardId";
    readonly value: number;
}, Data.Data<{
    readonly _id: "@effect/cluster/ShardId";
    readonly value: number;
}>>;
//# sourceMappingURL=ShardId.d.ts.map