/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context"
import * as Duration from "@effect/data/Duration"
import * as Layer from "@effect/io/Layer"

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
  numberOfShards: number
  apiPort: number
  rebalanceInterval: Duration.Duration
  rebalanceRetryInterval: Duration.Duration
  pingTimeout: Duration.Duration
  persistRetryInterval: Duration.Duration
  persistRetryCount: number
  rebalanceRate: number
}

/**
 * @since 1.0.0
 * @category context
 */
export const ManagerConfig = Tag<ManagerConfig>()

/**
 * @since 1.0.0
 * @category utils
 */
export const defaults = Layer.succeed(ManagerConfig, {
  numberOfShards: 300,
  apiPort: 8080,
  rebalanceInterval: Duration.seconds(20),
  rebalanceRetryInterval: Duration.seconds(10),
  pingTimeout: Duration.seconds(3),
  persistRetryInterval: Duration.seconds(3),
  persistRetryCount: 100,
  rebalanceRate: 2 / 100
})
