/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as Data from "effect/Data";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const ShardingErrorSerializationTag: "@effect/sharding/ShardingErrorSerialization";
declare const ShardingErrorSerializationSchema_: Schema.Schema<{
    readonly _tag: "@effect/sharding/ShardingErrorSerialization";
    readonly error: string;
}, Data.Data<{
    readonly _tag: "@effect/sharding/ShardingErrorSerialization";
    readonly error: string;
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingErrorSerialization extends Schema.Schema.To<typeof ShardingErrorSerializationSchema_> {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardingErrorSerialization(error: string): ShardingErrorSerialization;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isShardingErrorSerialization(value: any): value is ShardingErrorSerialization;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingErrorSerializationSchema: Schema.Schema<Schema.Schema.From<typeof ShardingErrorSerializationSchema_>, ShardingErrorSerialization>;
export {};
//# sourceMappingURL=ShardingErrorSerialization.d.ts.map