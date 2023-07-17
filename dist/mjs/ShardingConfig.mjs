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
export const TypeId = /*#__PURE__*/Symbol.for("@effect/shardcake/ShardingConfig");
/**
 * @since 1.0.0
 * @category context
 */
export const ShardingConfig = /*#__PURE__*/Tag();
/**
 * @since 1.0.0
 * @category layers
 */
export const defaults = /*#__PURE__*/Layer.succeed(ShardingConfig, {
  numberOfShards: 300,
  selfHost: "localhost",
  shardingPort: 54321,
  shardManagerUri: "http://localhost:8080/api/rest",
  serverVersion: "1.0.0",
  entityMaxIdleTime: /*#__PURE__*/Duration.minutes(1),
  entityTerminationTimeout: /*#__PURE__*/Duration.seconds(3),
  sendTimeout: /*#__PURE__*/Duration.seconds(5),
  refreshAssignmentsRetryInterval: /*#__PURE__*/Duration.seconds(5),
  unhealthyPodReportInterval: /*#__PURE__*/Duration.seconds(5),
  simulateRemotePods: false
});
/**
 * @since 1.0.0
 * @category layers
 */
export function withDefaults(customs) {
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
  });
}
//# sourceMappingURL=ShardingConfig.mjs.map