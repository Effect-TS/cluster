/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as Data from "effect/Data";
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingErrorSendTimeoutTag: "@effect/sharding/ShardingErrorSendTimeout";
declare const ShardingErrorSendTimeoutSchema_: Schema.Schema<{
    readonly _tag: "@effect/sharding/ShardingErrorSendTimeout";
}, Data.Data<{
    readonly _tag: "@effect/sharding/ShardingErrorSendTimeout";
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingErrorSendTimeout extends Schema.Schema.To<typeof ShardingErrorSendTimeoutSchema_> {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardingErrorSendTimeout(): ShardingErrorSendTimeout;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isShardingErrorSendTimeout(value: any): value is ShardingErrorSendTimeout;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingErrorSendTimeoutSchema: Schema.Schema<Schema.Schema.From<typeof ShardingErrorSendTimeoutSchema_>, ShardingErrorSendTimeout>;
export {};
//# sourceMappingURL=ShardingErrorSendTimeout.d.ts.map