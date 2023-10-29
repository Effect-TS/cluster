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
export declare const ShardingErrorPodUnavailableTag: "@effect/cluster/ShardingErrorPodUnavailable";
declare const ShardingErrorPodUnavailableSchema_: Schema.Schema<{
    readonly _tag: "@effect/cluster/ShardingErrorPodUnavailable";
    readonly pod: {
        readonly _id: "@effect/cluster/PodAddress";
        readonly host: string;
        readonly port: number;
    };
}, Data.Data<{
    readonly _tag: "@effect/cluster/ShardingErrorPodUnavailable";
    readonly pod: Data.Data<{
        readonly _id: "@effect/cluster/PodAddress";
        readonly host: string;
        readonly port: number;
    }>;
}>>;
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingErrorPodUnavailable extends Schema.Schema.To<typeof ShardingErrorPodUnavailableSchema_> {
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
export declare const ShardingErrorPodUnavailableSchema: Schema.Schema<Schema.Schema.From<typeof ShardingErrorPodUnavailableSchema_>, ShardingErrorPodUnavailable>;
export {};
//# sourceMappingURL=ShardingErrorPodUnavailable.d.ts.map