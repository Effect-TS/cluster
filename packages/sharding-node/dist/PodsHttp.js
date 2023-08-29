"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.httpPods = void 0;
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Layer"));
var Http = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/platform/HttpClient"));
var ShardingProtocolHttp = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding-node/ShardingProtocolHttp"));
var _utils = /*#__PURE__*/require("@effect/sharding-node/utils");
var Pods = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/Pods"));
var _ShardingError = /*#__PURE__*/require("@effect/sharding/ShardingError");
var Stream = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/stream/Stream"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/** @internal */
function asHttpUrl(pod) {
  return `http://${pod.host}:${pod.port}`;
}
/**
 * @since 1.0.0
 * @category layers
 */
const httpPods = /*#__PURE__*/Layer.effect(Pods.Pods, /*#__PURE__*/Effect.gen(function* (_) {
  const client = yield* _(Http.client.Client, Effect.map(Http.client.filterStatusOk));
  function assignShards(podAddress, shards) {
    return Effect.gen(function* (_) {
      const request = yield* _(Http.request.post("/assign-shards"), Http.request.prependUrl(asHttpUrl(podAddress)), Http.request.schemaBody(ShardingProtocolHttp.AssignShard_)({
        shards: Array.from(shards)
      }));
      return yield* _(client(request));
    }).pipe(Effect.asUnit, Effect.orDie);
  }
  function unassignShards(podAddress, shards) {
    return Effect.gen(function* (_) {
      const request = yield* _(Http.request.post("/unassign-shards"), Http.request.prependUrl(asHttpUrl(podAddress)), Http.request.schemaBody(ShardingProtocolHttp.UnassignShards_)({
        shards: Array.from(shards)
      }));
      return yield* _(client(request));
    }).pipe(Effect.asUnit, Effect.orDie);
  }
  function ping(podAddress) {
    return Effect.gen(function* (_) {
      const request = Http.request.prependUrl(asHttpUrl(podAddress))(Http.request.get("/ping"));
      return yield* _(client(request));
    }).pipe(Effect.asUnit, Effect.mapError(e => {
      console.log("error is ", e);
      return (0, _ShardingError.ShardingErrorPodUnavailable)(podAddress);
    }));
  }
  function sendMessage(podAddress, binaryMessage) {
    return Effect.gen(function* (_) {
      const request = yield* _(Http.request.post("/send-message"), Http.request.prependUrl(asHttpUrl(podAddress)), Http.request.schemaBody(ShardingProtocolHttp.Send_)({
        message: binaryMessage
      }));
      const response = yield* _(client(request), Effect.flatMap(Http.response.schemaBodyJson(ShardingProtocolHttp.SendResult_)));
      return response;
    }).pipe(Effect.orDie, Effect.flatten);
  }
  function sendMessageStreaming(podAddress, binaryMessage) {
    return Effect.gen(function* (_) {
      const request = yield* _(Http.request.post("/send-message-streaming"), Http.request.prependUrl(asHttpUrl(podAddress)), Http.request.schemaBody(ShardingProtocolHttp.SendStream_)({
        message: binaryMessage
      }));
      const response = yield* _(client(request), Effect.map(response => response.stream));
      return Stream.mapEffect(_ => (0, _utils.jsonParse)(_, ShardingProtocolHttp.SendStreamResultItem_))(Stream.splitLines((0, _utils.stringFromUint8ArrayString)("utf-8")(response)));
    }).pipe(Stream.fromEffect, Stream.flatten(), Stream.orDie, Stream.flatten());
  }
  const result = {
    _id: Pods.TypeId,
    assignShards,
    unassignShards,
    ping,
    sendMessage,
    sendMessageStreaming
  };
  return result;
}));
exports.httpPods = httpPods;
//# sourceMappingURL=PodsHttp.js.map