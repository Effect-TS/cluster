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
export declare const ShardingErrorPodUnavailableTag: "@effect/sharding/ShardingErrorPodUnavailable";
declare const ShardingErrorPodUnavailableSchema_: Schema.Schema<{
    readonly _tag: "@effect/sharding/ShardingErrorPodUnavailable";
    readonly pod: {
        readonly _id: "@effect/sharding/PodAddress";
        readonly host: string;
        readonly port: number;
    };
}, Data.Data<{
    readonly _tag: "@effect/sharding/ShardingErrorPodUnavailable";
    readonly pod: Data.Data<{
        readonly _id: "@effect/sharding/PodAddress";
        readonly host: string;
        readonly port: number;
    }>;
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingErrorPodUnavailable extends Schema.To<typeof ShardingErrorPodUnavailableSchema_> {
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardingErrorPodUnavailable(pod: PodAddress.PodAddress): ShardingErrorPodUnavailable;
/**
 * @since 1.0.0
 * @category utils
 */
export declare function isShardingErrorPodUnavailable(value: any): value is ShardingErrorPodUnavailable;
/**
 * @since 1.0.0
 * @category schema
 */
export declare const ShardingErrorPodUnavailableSchema: Schema.Schema<Schema.From<typeof ShardingErrorPodUnavailableSchema_>, ShardingErrorPodUnavailable>;
export {};
//# sourceMappingURL=ShardingErrorPodUnavailable.d.ts.map