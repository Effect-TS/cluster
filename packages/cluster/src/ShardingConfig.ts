/**
 * @since 1.0.0
 */
import { Tag } from "effect/Context"
import * as Duration from "effect/Duration"
import * as Layer from "effect/Layer"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId: unique symbol = Symbol.for("./ShardingConfig")

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

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
  readonly numberOfShards: number
  readonly selfHost: string
  readonly shardingPort: number
  readonly shardManagerUri: string
  readonly serverVersion: string
  readonly entityMaxIdleTime: Duration.Duration
  readonly entityTerminationTimeout: Duration.Duration
  readonly sendTimeout: Duration.Duration
  readonly refreshAssignmentsRetryInterval: Duration.Duration
  readonly unhealthyPodReportInterval: Duration.Duration
  readonly simulateRemotePods: boolean
}

/**
 * @since 1.0.0
 * @category context
 */
export const ShardingConfig = Tag<ShardingConfig>()

/**
 * @since 1.0.0
 * @category layers
 */
export const defaults = Layer.succeed(ShardingConfig, {
  numberOfShards: 300,
  selfHost: "localhost",
  shardingPort: 54321,
  shardManagerUri: "http://localhost:8080/api/rest",
  serverVersion: "1.0.0",
  entityMaxIdleTime: Duration.minutes(1),
  entityTerminationTimeout: Duration.seconds(3),
  sendTimeout: Duration.seconds(5),
  refreshAssignmentsRetryInterval: Duration.seconds(5),
  unhealthyPodReportInterval: Duration.seconds(5),
  simulateRemotePods: false
})

/**
 * @since 1.0.0
 * @category layers
 */
export function withDefaults(customs: Partial<ShardingConfig>) {
  return Layer.succeed(ShardingConfig, {
    numberOfShards: 300,
    selfHost: "localhost",
    shardingPort: 54321,
    shardManagerUri: "http://localhost:8080/api/rest",
    serverVersion: "1.0.0",
    entityMaxIdleTime: Duration.minutes(1),
    entityTerminationTimeout: Duration.seconds(3),
    sendTimeout: Duration.seconds(5),
    refreshAssignmentsRetryInterval: Duration.seconds(5),
    unhealthyPodReportInterval: Duration.seconds(5),
    simulateRemotePods: false,
    ...customs
  })
}
