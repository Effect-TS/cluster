/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context";
import * as Duration from "@effect/data/Duration";
import * as Layer from "@effect/io/Layer";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId: unique symbol;
/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;
/**
 * Sharding configuration
 * @param numberOfShards number of shards (see documentation on how to choose this), should be same on all nodes
 * @param selfHost hostname or IP address of the current pod
 * @param shardingPort port used for pods to communicate together
 * @param shardManagerUri url of the Shard Manager GraphQL API
 * @param serverVersion version of the current pod
 * @param entityMaxIdleTime time of inactivity (without receiving any message) after which an entity will be interrupted
 * @param entityTerminationTimeout time we give to an entity to handle the termination message before interrupting it
 * @param sendTimeout timeout when calling sendMessage
 * @param refreshAssignmentsRetryInterval retry interval in case of failure getting shard assignments from storage
 * @param unhealthyPodReportInterval interval to report unhealthy pods to the Shard Manager (this exists to prevent calling the Shard Manager for each failed message)
 * @param simulateRemotePods disable optimizations when sending a message to an entity hosted on the local shards (this will force serialization of all messages)
 * @since 1.0.0
 * @category models
 */
export interface ShardingConfig {
    readonly numberOfShards: number;
    readonly selfHost: string;
    readonly shardingPort: number;
    readonly shardManagerUri: string;
    readonly serverVersion: string;
    readonly entityMaxIdleTime: Duration.Duration;
    readonly entityTerminationTimeout: Duration.Duration;
    readonly sendTimeout: Duration.Duration;
    readonly refreshAssignmentsRetryInterval: Duration.Duration;
    readonly unhealthyPodReportInterval: Duration.Duration;
    readonly simulateRemotePods: boolean;
}
/**
 * @since 1.0.0
 * @category context
 */
export declare const ShardingConfig: Tag<ShardingConfig, ShardingConfig>;
/**
 * @since 1.0.0
 * @category layers
 */
export declare const defaults: Layer.Layer<never, never, ShardingConfig>;
/**
 * @since 1.0.0
 * @category layers
 */
export declare function withDefaults(customs: Partial<ShardingConfig>): Layer.Layer<never, never, ShardingConfig>;
//# sourceMappingURL=ShardingConfig.d.ts.map