"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shardManagerHttp = void 0;
var _Function = /*#__PURE__*/require("@effect/data/Function");
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var ManagerConfig = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ManagerConfig"));
var ShardManager = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ShardManager"));
var ShardManagerProtocolHttp = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ShardManagerProtocolHttp"));
var _node = /*#__PURE__*/require("./node");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category layers
 */
const shardManagerHttp = fa => (0, _Function.pipe)(ShardManager.ShardManager, Effect.flatMap(shardManager => (0, _Function.pipe)(ManagerConfig.ManagerConfig, Effect.flatMap(managerConfig => (0, _Function.pipe)(fa, (0, _node.asHttpServer)(managerConfig.apiPort, ShardManagerProtocolHttp.schema, (req, reply) => {
  switch (req._tag) {
    case "Register":
      return reply(ShardManagerProtocolHttp.RegisterResult_)(Effect.as(shardManager.register(req.pod), true));
    case "Unregister":
      return reply(ShardManagerProtocolHttp.UnregisterResult_)(Effect.as(shardManager.unregister(req.pod.address), true));
    case "NotifyUnhealthyPod":
      return reply(ShardManagerProtocolHttp.NotifyUnhealthyPodResult_)(Effect.as(shardManager.notifyUnhealthyPod(req.podAddress), true));
    case "GetAssignments":
      return reply(ShardManagerProtocolHttp.GetAssignmentsResult_)(Effect.map(shardManager.getAssignments, _ => Array.from(_)));
  }
}))))));
exports.shardManagerHttp = shardManagerHttp;
//# sourceMappingURL=ShardManagerHttp.js.map