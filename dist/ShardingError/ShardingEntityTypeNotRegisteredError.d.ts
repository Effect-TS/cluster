/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
import * as PodAddress from "@effect/shardcake/PodAddress";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const ShardingEntityTypeNotRegisteredErrorTag: "@effect/shardcake/ShardingEntityTypeNotRegisteredError";
declare const ShardingEntityTypeNotRegisteredErrorSchema_: Schema.Schema<{
    readonly _tag: "@effect/shardcake/ShardingEntityTypeNotRegisteredError";
    readonly entityType: string;
    readonly podAddress: {
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    };
}, Data.Data<{
    readonly _tag: "@effect/shardcake/ShardingEntityTypeNotRegisteredError";
    readonly entityType: string;
    readonly podAddress: Data.Data<{
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    }>;
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingEntityTypeNotRegisteredError extends Schema.To<typeof ShardingEntityTypeNotRegisteredErrorSchema_> {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardingEntityTypeNotRegisteredError(entityType: string, podAddress: PodAddress.PodAddress): ShardingEntityTypeNotRegisteredError;
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function isShardingEntityTypeNotRegisteredError(value: unknown): value is ShardingEntityTypeNotRegisteredError;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingEntityTypeNotRegisteredErrorSchema: Schema.Schema<Schema.From<typeof ShardingEntityTypeNotRegisteredErrorSchema_>, ShardingEntityTypeNotRegisteredError>;
export {};
//# sourceMappingURL=ShardingEntityTypeNotRegisteredError.d.ts.map