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
    readonly _tag: "@effect/sharding/ShardingMessageQueueError";
    readonly error: string;
}, Data.Data<{
    readonly _tag: "@effect/sharding/ShardingMessageQueueError";
    readonly error: string;
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