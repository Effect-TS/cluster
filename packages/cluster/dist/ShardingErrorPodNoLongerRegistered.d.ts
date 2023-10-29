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
export declare const ShardingErrorPodNoLongerRegisteredTag: "@effect/cluster/ShardingErrorPodNoLongerRegistered";
declare const ShardingErrorPodNoLongerRegisteredSchema_: Schema.Schema<{
    readonly _tag: "@effect/cluster/ShardingErrorPodNoLongerRegistered";
    readonly podAddress: {
        readonly _id: "@effect/cluster/PodAddress";
        readonly host: string;
        readonly port: number;
    };
}, Data.Data<{
    readonly _tag: "@effect/cluster/ShardingErrorPodNoLongerRegistered";
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
export interface ShardingErrorPodNoLongerRegistered extends Schema.Schema.To<typeof ShardingErrorPodNoLongerRegisteredSchema_> {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardingErrorPodNoLongerRegistered(podAddress: PodAddress.PodAddress): ShardingErrorPodNoLongerRegistered;
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function isShardingErrorPodNoLongerRegistered(value: unknown): value is ShardingErrorPodNoLongerRegistered;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingErrorPodNoLongerRegisteredSchema: Schema.Schema<Schema.Schema.From<typeof ShardingErrorPodNoLongerRegisteredSchema_>, ShardingErrorPodNoLongerRegistered>;
export {};
//# sourceMappingURL=ShardingErrorPodNoLongerRegistered.d.ts.map