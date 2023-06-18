import { Tag } from "@effect/data/Context"
import * as Duration from "@effect/data/Duration"

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
export const ManagerConfig = Tag<ManagerConfig>()

export const defaults: ManagerConfig = {
  numberOfShards: 300,
  apiPort: 8080,
  rebalanceInterval: Duration.seconds(20),
  rebalanceRetryInterval: Duration.seconds(10),
  pingTimeout: Duration.seconds(3),
  persistRetryInterval: Duration.seconds(3),
  persistRetryCount: 100,
  rebalanceRate: 2 / 100
}
