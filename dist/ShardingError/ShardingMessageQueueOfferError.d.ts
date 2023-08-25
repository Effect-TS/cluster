/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const ShardingMessageQueueOfferErrorTag: "@effect/shardcake/ShardingMessageQueueOfferError";
declare const ShardingMessageQueueOfferErrorSchema_: Schema.Schema<{
    readonly _tag: "@effect/shardcake/ShardingMessageQueueOfferError";
    readonly error: string;
}, Data.Data<{
    readonly _tag: "@effect/shardcake/ShardingMessageQueueOfferError";
    readonly error: string;
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingMessageQueueOfferError extends Schema.To<typeof ShardingMessageQueueOfferErrorSchema_> {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardingMessageQueueOfferError(error: string): ShardingMessageQueueOfferError;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isShardingMessageQueueOfferError(value: unknown): value is ShardingMessageQueueOfferError;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingMessageQueueOfferErrorSchema: Schema.Schema<Schema.From<typeof ShardingMessageQueueOfferErrorSchema_>, ShardingMessageQueueOfferError>;
export {};
//# sourceMappingURL=ShardingMessageQueueOfferError.d.ts.map