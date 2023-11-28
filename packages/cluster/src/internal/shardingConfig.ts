import * as Context from "effect/Context"
import * as Duration from "effect/Duration"
import * as Layer from "effect/Layer"
import type * as ShardingConfig from "../ShardingConfig.js"

/** @internal */
const ShardingConfigSymbolKey = "@effect/cluster/ShardingConfig"

/** @internal */
export const ShardingConfigTypeId: ShardingConfig.ShardingConfigTypeId = Symbol.for(
  ShardingConfigSymbolKey
) as ShardingConfig.ShardingConfigTypeId

/** @internal */
export const shardingConfigTag = Context.Tag<ShardingConfig.ShardingConfig>(ShardingConfigTypeId)

/** @internal */
export const defaults = Layer.succeed(shardingConfigTag, {
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

/** @internal */
export function withDefaults(customs: Partial<ShardingConfig.ShardingConfig>) {
  return Layer.succeed(shardingConfigTag, {
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
