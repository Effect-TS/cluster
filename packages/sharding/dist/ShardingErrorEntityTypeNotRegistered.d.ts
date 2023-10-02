/**
 * @since 1.0.0
 */
import * as Data from "effect/Data";
import * as Schema from "@effect/schema/Schema";
import * as PodAddress from "@effect/sharding/PodAddress";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const ShardingErrorEntityTypeNotRegisteredTag: "@effect/sharding/ShardingErrorEntityTypeNotRegistered";
declare const ShardingErrorEntityTypeNotRegisteredSchema_: Schema.Schema<{
    readonly entityType: string;
    readonly _tag: "@effect/sharding/ShardingErrorEntityTypeNotRegistered";
    readonly podAddress: {
        readonly _id: "@effect/sharding/PodAddress";
        readonly host: string;
        readonly port: number;
    };
}, Data.Data<{
    readonly entityType: string;
    readonly _tag: "@effect/sharding/ShardingErrorEntityTypeNotRegistered";
    readonly podAddress: Data.Data<{
        readonly _id: "@effect/sharding/PodAddress";
        readonly host: string;
        readonly port: number;
    }>;
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingErrorEntityTypeNotRegistered extends Schema.To<typeof ShardingErrorEntityTypeNotRegisteredSchema_> {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardingErrorEntityTypeNotRegistered(entityType: string, podAddress: PodAddress.PodAddress): ShardingErrorEntityTypeNotRegistered;
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function isShardingErrorEntityTypeNotRegistered(value: unknown): value is ShardingErrorEntityTypeNotRegistered;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingErrorEntityTypeNotRegisteredSchema: Schema.Schema<Schema.From<typeof ShardingErrorEntityTypeNotRegisteredSchema_>, ShardingErrorEntityTypeNotRegistered>;
export {};
//# sourceMappingURL=ShardingErrorEntityTypeNotRegistered.d.ts.map
