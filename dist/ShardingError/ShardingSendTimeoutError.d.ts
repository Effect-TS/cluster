/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingSendTimeoutErrorTag: "@effect/shardcake/ShardingSendTimeoutError";
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingSendTimeoutErrorSchema: Schema.Schema<{
    readonly _tag: "@effect/shardcake/ShardingSendTimeoutError";
}, Data.Data<{
    readonly _tag: "@effect/shardcake/ShardingSendTimeoutError";
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingSendTimeoutError extends Schema.To<typeof ShardingSendTimeoutErrorSchema> {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardingSendTimeoutError(): ShardingSendTimeoutError;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isShardingSendTimeoutError(value: any): value is ShardingSendTimeoutError;
//# sourceMappingURL=ShardingSendTimeoutError.d.ts.map