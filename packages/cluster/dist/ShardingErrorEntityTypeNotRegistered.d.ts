/**
 * @since 1.0.0
 */
import * as PodAddress from "@effect/cluster/PodAddress";
import * as Schema from "@effect/schema/Schema";
import * as Data from "effect/Data";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const ShardingErrorEntityTypeNotRegisteredTag: "@effect/cluster/ShardingErrorEntityTypeNotRegistered";
declare const ShardingErrorEntityTypeNotRegisteredSchema_: Schema.Schema<{
    readonly _tag: "@effect/cluster/ShardingErrorEntityTypeNotRegistered";
    readonly entityType: string;
    readonly podAddress: {
        readonly _id: "@effect/cluster/PodAddress";
        readonly host: string;
        readonly port: number;
    };
}, Data.Data<{
    readonly _tag: "@effect/cluster/ShardingErrorEntityTypeNotRegistered";
    readonly entityType: string;
    readonly podAddress: Data.Data<{
        readonly _id: "@effect/cluster/PodAddress";
        readonly host: string;
        readonly port: number;
    }>;
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingErrorEntityTypeNotRegistered extends Schema.Schema.To<typeof ShardingErrorEntityTypeNotRegisteredSchema_> {
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
export declare const ShardingErrorEntityTypeNotRegisteredSchema: Schema.Schema<Schema.Schema.From<typeof ShardingErrorEntityTypeNotRegisteredSchema_>, ShardingErrorEntityTypeNotRegistered>;
export {};
//# sourceMappingURL=ShardingErrorEntityTypeNotRegistered.d.ts.map