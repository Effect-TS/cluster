/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const ShardingReplyErrorTag: "@effect/shardcake/ShardingReplyError";
/**
 * @since 1.0.0
 * @category models
 */
export declare const ShardingReplyErrorSchema: Schema.Schema<{
    readonly _tag: "@effect/shardcake/ShardingReplyError";
    readonly error: string;
}, Data.Data<{
    readonly _tag: "@effect/shardcake/ShardingReplyError";
    readonly error: string;
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingReplyError extends Schema.To<typeof ShardingReplyErrorSchema> {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardingReplyError(error: string): ShardingReplyError;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isShardingReplyError(value: any): value is ShardingReplyError;
//# sourceMappingURL=ShardingReplyError.d.ts.map