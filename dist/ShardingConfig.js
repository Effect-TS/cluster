"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaults = exports.TypeId = exports.ShardingConfig = void 0;
exports.withDefaults = withDefaults;
var _Context = /*#__PURE__*/require("@effect/data/Context");
var Duration = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Duration"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Layer"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category symbols
 */
const TypeId = /*#__PURE__*/Symbol.for("@effect/shardcake/ShardingConfig");
/**
 * @since 1.0.0
 * @category context
 */
exports.TypeId = TypeId;
const ShardingConfig = /*#__PURE__*/(0, _Context.Tag)();
/**
 * @since 1.0.0
 * @category layers
 */
exports.ShardingConfig = ShardingConfig;
const defaults = /*#__PURE__*/Layer.succeed(ShardingConfig, {
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
exports.defaults = defaults;
function withDefaults(customs) {
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
//# sourceMappingURL=ShardingConfig.js.map