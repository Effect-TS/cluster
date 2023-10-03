/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as Data from "effect/Data";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const ShardingErrorMessageQueueTag: "@effect/sharding/ShardingErrorMessageQueue";
declare const ShardingErrorMessageQueueSchema_: Schema.Schema<{
    readonly _tag: "@effect/sharding/ShardingErrorMessageQueue";
    readonly error: string;
}, Data.Data<{
    readonly _tag: "@effect/sharding/ShardingErrorMessageQueue";
    readonly error: string;
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingErrorMessageQueue extends Schema.Schema.To<typeof ShardingErrorMessageQueueSchema_> {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardingErrorMessageQueue(error: string): ShardingErrorMessageQueue;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isShardingErrorMessageQueue(value: unknown): value is ShardingErrorMessageQueue;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingErrorMessageQueueSchema: Schema.Schema<Schema.Schema.From<typeof ShardingErrorMessageQueueSchema_>, ShardingErrorMessageQueue>;
export {};
//# sourceMappingURL=ShardingErrorMessageQueue.d.ts.map