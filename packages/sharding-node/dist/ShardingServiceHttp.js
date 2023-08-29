"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shardingServiceHttp = void 0;
var Either = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Either"));
var HashSet = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashSet"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Layer"));
var Http = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/platform-node/HttpServer"));
var ShardingProtocolHttp = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding-node/ShardingProtocolHttp"));
var _utils = /*#__PURE__*/require("@effect/sharding-node/utils");
var Sharding = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/Sharding"));
var ShardingConfig = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ShardingConfig"));
var Stream = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/stream/Stream"));
var _nodeHttp = /*#__PURE__*/require("node:http");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

const internalServer = /*#__PURE__*/Layer.unwrapEffect( /*#__PURE__*/Effect.gen(function* (_) {
  const config = yield* _(ShardingConfig.ShardingConfig);
  return Http.server.layer(() => (0, _nodeHttp.createServer)(), {
    port: config.shardingPort
  });
}));
/**
 * @since 1.0.0
 * @category layers
 */
const shardingServiceHttp = /*#__PURE__*/Layer.scopedDiscard(Effect.gen(function* (_) {
  const sharding = yield* _(Sharding.Sharding);
  return yield* _(Http.router.empty.pipe(Http.router.post("/assign-shards", Effect.gen(function* (_) {
    const body = yield* _(Http.request.schemaBodyJson(ShardingProtocolHttp.AssignShard_));
    yield* _(sharding.assign(HashSet.fromIterable(body.shards)));
    return yield* _(Http.response.json(true));
  })), Http.router.post("/unassign-shards", Effect.gen(function* (_) {
    const body = yield* _(Http.request.schemaBodyJson(ShardingProtocolHttp.UnassignShards_));
    yield* _(sharding.unassign(HashSet.fromIterable(body.shards)));
    return yield* _(Http.response.json(true));
  })), Http.router.get("/ping", Effect.gen(function* (_) {
    return yield* _(Http.response.json(true));
  })), Http.router.post("/send-message", Effect.gen(function* (_) {
    const body = yield* _(Http.request.schemaBodyJson(ShardingProtocolHttp.Send_));
    const result = yield* _(sharding.sendToLocalEntitySingleReply(body.message), Effect.match({
      onFailure: Either.left,
      onSuccess: Either.right
    }));
    return yield* _(Http.response.schemaJson(ShardingProtocolHttp.SendResult_)(result));
  })), Http.router.post("/send-message-streaming", Effect.gen(function* (_) {
    const body = yield* _(Http.request.schemaBodyJson(ShardingProtocolHttp.SendStream_));
    const result = (0, _utils.uint8ArrayFromStringStream)()(Stream.mapEffect(_ => (0, _utils.jsonStringify)(_, ShardingProtocolHttp.SendStreamResultItem_))(Stream.catchAll(e => Stream.succeed(Either.left(e)))(Stream.map(_ => Either.right(_))(sharding.sendToLocalEntityStreamingReply(body.message)))));
    return Http.response.stream(result, {
      contentType: "text/event-stream"
    });
  })), Http.server.serve(Http.middleware.logger)));
})).pipe( /*#__PURE__*/Layer.use(internalServer));
exports.shardingServiceHttp = shardingServiceHttp;
//# sourceMappingURL=ShardingServiceHttp.js.map