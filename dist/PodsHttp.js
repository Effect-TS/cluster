"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.httpPods = void 0;
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Layer"));
var Pods = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/Pods"));
var _ShardingError = /*#__PURE__*/require("@effect/shardcake/ShardingError");
var ShardingProtocolHttp = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ShardingProtocolHttp"));
var Stream = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/stream/Stream"));
var _utils = /*#__PURE__*/require("./utils");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/** @internal */
function asHttpUrl(pod) {
  return `http://${pod.host}:${pod.port}/`;
}
/**
 * @since 1.0.0
 * @category layers
 */
const httpPods = /*#__PURE__*/Layer.succeed(Pods.Pods, {
  _id: Pods.TypeId,
  assignShards: (pod, shards) => Effect.orDie((0, _utils.send)(ShardingProtocolHttp.AssignShard_, ShardingProtocolHttp.AssignShardResult_)(asHttpUrl(pod), {
    _tag: "AssignShards",
    shards: Array.from(shards)
  })),
  unassignShards: (pod, shards) => Effect.orDie((0, _utils.send)(ShardingProtocolHttp.UnassignShards_, ShardingProtocolHttp.UnassignShardsResult_)(asHttpUrl(pod), {
    _tag: "UnassignShards",
    shards: Array.from(shards)
  })),
  ping: pod => Effect.catchAllDefect(e => {
    if ((0, _utils.isFetchError)(e)) {
      return Effect.fail((0, _ShardingError.ShardingPodUnavailableError)(pod));
    }
    return Effect.die(e);
  })((0, _utils.send)(ShardingProtocolHttp.PingShards_, ShardingProtocolHttp.PingShardsResult_)(asHttpUrl(pod), {
    _tag: "PingShards"
  })),
  sendMessage: (pod, message) => Effect.orDie((0, _utils.send)(ShardingProtocolHttp.Send_, ShardingProtocolHttp.SendResult_)(asHttpUrl(pod), {
    _tag: "Send",
    message
  })),
  sendMessageStreaming: (pod, message) => Stream.orDie((0, _utils.sendStream)(ShardingProtocolHttp.SendStream_, ShardingProtocolHttp.SendStreamResultItem_)(asHttpUrl(pod), {
    _tag: "SendStream",
    message
  }))
});
exports.httpPods = httpPods;
//# sourceMappingURL=PodsHttp.js.map