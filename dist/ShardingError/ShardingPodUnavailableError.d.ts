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
export declare const ShardingPodUnavailableErrorTag: "@effect/shardcake/ShardingPodUnavailableError";
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingPodUnavailableErrorSchema: Schema.Schema<{
    readonly _tag: "@effect/shardcake/ShardingPodUnavailableError";
    readonly pod: {
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    };
}, Data.Data<{
    readonly _tag: "@effect/shardcake/ShardingPodUnavailableError";
    readonly pod: Data.Data<{
        readonly _id: "@effect/shardcake/PodAddress";
        readonly host: string;
        readonly port: number;
    }>;
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingPodUnavailableError extends Schema.To<typeof ShardingPodUnavailableErrorSchema> {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardingPodUnavailableError(pod: PodAddress.PodAddress): ShardingPodUnavailableError;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isShardingPodUnavailableError(value: any): value is ShardingPodUnavailableError;
//# sourceMappingURL=ShardingPodUnavailableError.d.ts.map