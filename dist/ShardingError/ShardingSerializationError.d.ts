/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const ShardingSerializationErrorTag: "@effect/shardcake/ShardingSerializationError";
declare const ShardingSerializationErrorSchema_: Schema.Schema<{
    readonly _tag: "@effect/shardcake/ShardingSerializationError";
    readonly error: string;
}, Data.Data<{
    readonly _tag: "@effect/shardcake/ShardingSerializationError";
    readonly error: string;
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingSerializationError extends Schema.To<typeof ShardingSerializationErrorSchema_> {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardingSerializationError(error: string): ShardingSerializationError;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isShardingSerializationError(value: any): value is ShardingSerializationError;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingSerializationErrorSchema: Schema.Schema<Schema.From<typeof ShardingSerializationErrorSchema_>, ShardingSerializationError>;
export {};
//# sourceMappingURL=ShardingSerializationError.d.ts.map