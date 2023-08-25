"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shardingServiceHttp = void 0;
var HashSet = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashSet"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var Sharding = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/Sharding"));
var ShardingConfig = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ShardingConfig"));
var _ShardingError = /*#__PURE__*/require("@effect/shardcake/ShardingError");
var ShardingProtocolHttp = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ShardingProtocolHttp"));
var Stream = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/stream/Stream"));
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
const shardingServiceHttp = fa => Effect.flatMap(sharding => Effect.flatMap(config => (0, _node.asHttpServer)(config.shardingPort, ShardingProtocolHttp.schema, (req, reply, replyStream) => {
  switch (req._tag) {
    case "AssignShards":
      return reply(ShardingProtocolHttp.AssignShardResult_)(Effect.as(sharding.assign(HashSet.fromIterable(req.shards)), true));
    case "UnassignShards":
      return reply(ShardingProtocolHttp.UnassignShardsResult_)(Effect.as(sharding.unassign(HashSet.fromIterable(req.shards)), true));
    case "Send":
      return reply(ShardingProtocolHttp.SendResult_)(Effect.catchAll(e => (0, _ShardingError.isShardingEntityTypeNotRegisteredError)(e) ? Effect.fail(e) : Effect.die(e))(sharding.sendToLocalEntitySingleReply(req.message)));
    case "SendStream":
      return replyStream(ShardingProtocolHttp.SendStreamResultItem_)(Stream.catchAll(e => (0, _ShardingError.isShardingEntityTypeNotRegisteredError)(e) ? Stream.fail(e) : Stream.die(e))(sharding.sendToLocalEntityStreamingReply(req.message)));
    case "PingShards":
      return reply(ShardingProtocolHttp.PingShardsResult_)(Effect.succeed(true));
  }
  return Effect.die("Unhandled");
})(fa))(ShardingConfig.ShardingConfig))(Sharding.Sharding);
exports.shardingServiceHttp = shardingServiceHttp;
//# sourceMappingURL=ShardingServiceHttp.js.map