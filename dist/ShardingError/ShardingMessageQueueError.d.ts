/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const ShardingMessageQueueErrorTag: "@effect/sharding/ShardingMessageQueueError";
declare const ShardingMessageQueueErrorSchema_: Schema.Schema<{
    readonly error: string;
    readonly _tag: "@effect/sharding/ShardingMessageQueueError";
}, Data.Data<{
    readonly error: string;
    readonly _tag: "@effect/sharding/ShardingMessageQueueError";
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingMessageQueueError extends Schema.To<typeof ShardingMessageQueueErrorSchema_> {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardingMessageQueueError(error: string): ShardingMessageQueueError;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isShardingMessageQueueError(value: unknown): value is ShardingMessageQueueError;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingMessageQueueErrorSchema: Schema.Schema<Schema.From<typeof ShardingMessageQueueErrorSchema_>, ShardingMessageQueueError>;
export {};
//# sourceMappingURL=ShardingMessageQueueError.d.ts.map