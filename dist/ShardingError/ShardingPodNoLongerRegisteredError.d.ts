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
export declare const ShardingPodNoLongerRegisteredErrorTag: "@effect/shardcake/ShardingPodNoLongerRegisteredError";
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingPodNoLongerRegisteredErrorSchema: Schema.Schema<{
    readonly _tag: "@effect/shardcake/ShardingPodNoLongerRegisteredError";
    readonly podAddress: {
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    };
}, Data.Data<{
    readonly _tag: "@effect/shardcake/ShardingPodNoLongerRegisteredError";
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
export interface ShardingPodNoLongerRegisteredError extends Schema.To<typeof ShardingPodNoLongerRegisteredErrorSchema> {
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
//# sourceMappingURL=ShardingPodNoLongerRegisteredError.d.ts.map