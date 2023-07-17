/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context";
import * as Duration from "@effect/data/Duration";
/**
 * Shard Manager configuration
 * @param numberOfShards number of shards (see documentation on how to choose this), should be same on all nodes
 * @param apiPort port to expose the GraphQL API
 * @param rebalanceInterval interval for regular rebalancing of shards
 * @param rebalanceRetryInterval retry interval for rebalancing when some shards failed to be rebalanced
 * @param pingTimeout time to wait for a pod to respond to a ping request
 * @param persistRetryInterval retry interval for persistence of pods and shard assignments
 * @param persistRetryCount max retry count for persistence of pods and shard assignments
 * @param rebalanceRate max ratio of shards to rebalance at once
 * @since 1.0.0
 * @category models
 */
export interface ManagerConfig {
    numberOfShards: number;
    apiPort: number;
    rebalanceInterval: Duration.Duration;
    rebalanceRetryInterval: Duration.Duration;
    pingTimeout: Duration.Duration;
    persistRetryInterval: Duration.Duration;
    persistRetryCount: number;
    rebalanceRate: number;
}
/**
 * @since 1.0.0
 * @category context
 */
export declare const ManagerConfig: Tag<ManagerConfig, ManagerConfig>;
/**
 * @since 1.0.0
 * @category utils
 */
export declare const defaults: ManagerConfig;
//# sourceMappingURL=ManagerConfig.d.ts.map