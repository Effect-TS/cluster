/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingSendTimeoutErrorTag: "@effect/sharding/ShardingSendTimeoutError";
declare const ShardingSendTimeoutErrorSchema_: Schema.Schema<{
    readonly _tag: "@effect/sharding/ShardingSendTimeoutError";
}, Data.Data<{
    readonly _tag: "@effect/sharding/ShardingSendTimeoutError";
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingSendTimeoutError extends Schema.To<typeof ShardingSendTimeoutErrorSchema_> {
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
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingSendTimeoutErrorSchema: Schema.Schema<Schema.From<typeof ShardingSendTimeoutErrorSchema_>, ShardingSendTimeoutError>;
export {};
//# sourceMappingURL=ShardingSendTimeoutError.d.ts.map