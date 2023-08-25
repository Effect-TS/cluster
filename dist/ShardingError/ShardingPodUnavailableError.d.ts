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
export declare const ShardingPodUnavailableErrorTag: "@effect/sharding/ShardingPodUnavailableError";
declare const ShardingPodUnavailableErrorSchema_: Schema.Schema<{
    readonly pod: {
        readonly _id: "@effect/sharding/PodAddress";
        readonly host: string;
        readonly port: number;
    };
    readonly _tag: "@effect/sharding/ShardingPodUnavailableError";
}, Data.Data<{
    readonly pod: Data.Data<{
        readonly _id: "@effect/sharding/PodAddress";
        readonly host: string;
        readonly port: number;
    }>;
    readonly _tag: "@effect/sharding/ShardingPodUnavailableError";
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingPodUnavailableError extends Schema.To<typeof ShardingPodUnavailableErrorSchema_> {
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
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingPodUnavailableErrorSchema: Schema.Schema<Schema.From<typeof ShardingPodUnavailableErrorSchema_>, ShardingPodUnavailableError>;
export {};
//# sourceMappingURL=ShardingPodUnavailableError.d.ts.map