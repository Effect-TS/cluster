/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const ShardingDecodeErrorTag: "@effect/shardcake/ShardingDecodeError";
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingDecodeErrorSchema: Schema.Schema<{
    readonly _tag: "@effect/shardcake/ShardingDecodeError";
    readonly error: string;
}, Data.Data<{
    readonly _tag: "@effect/shardcake/ShardingDecodeError";
    readonly error: string;
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingDecodeError extends Schema.To<typeof ShardingDecodeErrorSchema> {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardingDecodeError(error: string): ShardingDecodeError;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isShardingDecodeError(value: any): value is ShardingDecodeError;
//# sourceMappingURL=ShardingDecodeError.d.ts.map