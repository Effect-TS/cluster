/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";
import * as PodAddress from "@effect/sharding/PodAddress";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const ShardingPodNoLongerRegisteredErrorTag: "@effect/sharding/ShardingPodNoLongerRegisteredError";
declare const ShardingPodNoLongerRegisteredErrorSchema_: Schema.Schema<{
    readonly _tag: "@effect/sharding/ShardingPodNoLongerRegisteredError";
    readonly podAddress: {
        readonly _id: "@effect/sharding/PodAddress";
        readonly host: string;
        readonly port: number;
    };
}, Data.Data<{
    readonly _tag: "@effect/sharding/ShardingPodNoLongerRegisteredError";
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
export interface ShardingPodNoLongerRegisteredError extends Schema.To<typeof ShardingPodNoLongerRegisteredErrorSchema_> {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardingPodNoLongerRegisteredError(podAddress: PodAddress.PodAddress): ShardingPodNoLongerRegisteredError;
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function isShardingPodNoLongerRegisteredError(value: unknown): value is ShardingPodNoLongerRegisteredError;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingPodNoLongerRegisteredErrorSchema: Schema.Schema<Schema.From<typeof ShardingPodNoLongerRegisteredErrorSchema_>, ShardingPodNoLongerRegisteredError>;
export {};
//# sourceMappingURL=ShardingPodNoLongerRegisteredError.d.ts.map