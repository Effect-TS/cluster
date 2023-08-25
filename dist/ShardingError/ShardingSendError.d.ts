/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingSendErrorTag: "@effect/shardcake/ShardingSendError";
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingSendErrorSchema: Schema.Schema<{
    readonly _tag: "@effect/shardcake/ShardingSendError";
    readonly error: string;
}, Data.Data<{
    readonly _tag: "@effect/shardcake/ShardingSendError";
    readonly error: string;
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingSendError extends Schema.To<typeof ShardingSendErrorSchema> {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardingSendError(error: string): ShardingSendError;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isShardingSendError(value: any): value is ShardingSendError;
//# sourceMappingURL=ShardingSendError.d.ts.map