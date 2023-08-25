"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shardManagerClientHttp = void 0;
var HashMap = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashMap"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Layer"));
var Pod = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/Pod"));
var ShardingConfig = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ShardingConfig"));
var ShardManagerClient = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ShardManagerClient"));
var ShardManagerProtocolHttp = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ShardManagerProtocolHttp"));
var _utils = /*#__PURE__*/require("./utils");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category layers
 */
const shardManagerClientHttp = /*#__PURE__*/Layer.effect(ShardManagerClient.ShardManagerClient, /*#__PURE__*/Effect.map(config => ({
  register: podAddress => (0, _utils.send)(ShardManagerProtocolHttp.Register_, ShardManagerProtocolHttp.RegisterResult_)(config.shardManagerUri, {
    _tag: "Register",
    pod: Pod.make(podAddress, config.serverVersion)
  }),
  unregister: podAddress => (0, _utils.send)(ShardManagerProtocolHttp.Unregister_, ShardManagerProtocolHttp.UnregisterResult_)(config.shardManagerUri, {
    _tag: "Unregister",
    pod: Pod.make(podAddress, config.serverVersion)
  }),
  notifyUnhealthyPod: podAddress => (0, _utils.send)(ShardManagerProtocolHttp.NotifyUnhealthyPod_, ShardManagerProtocolHttp.NotifyUnhealthyPodResult_)(config.shardManagerUri, {
    _tag: "NotifyUnhealthyPod",
    podAddress
  }),
  getAssignments: Effect.map(data => HashMap.fromIterable(data))((0, _utils.send)(ShardManagerProtocolHttp.GetAssignments_, ShardManagerProtocolHttp.GetAssignmentsResult_)(config.shardManagerUri, {
    _tag: "GetAssignments"
  }))
}))(ShardingConfig.ShardingConfig));
exports.shardManagerClientHttp = shardManagerClientHttp;
//# sourceMappingURL=ShardManagerClientHttp.js.map