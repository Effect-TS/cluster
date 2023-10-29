"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shardManagerHttp = void 0;
var ShardManagerProtocolHttp = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster-node/ShardManagerProtocolHttp"));
var ManagerConfig = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/ManagerConfig"));
var ShardManager = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/ShardManager"));
var Http = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/platform-node/HttpServer"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Effect"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Layer"));
var _nodeHttp = /*#__PURE__*/require("node:http");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

const internalServer = /*#__PURE__*/Layer.unwrapEffect( /*#__PURE__*/Effect.gen(function* (_) {
  const managerConfig = yield* _(ManagerConfig.ManagerConfig);
  return Http.server.layer(() => (0, _nodeHttp.createServer)(), {
    port: managerConfig.apiPort
  });
}));
/**
 * @since 1.0.0
 * @category layers
 */
const shardManagerHttp = /*#__PURE__*/Layer.scopedDiscard(Effect.gen(function* (_) {
  const shardManager = yield* _(ShardManager.ShardManager);
  return yield* _(Http.router.empty.pipe(Http.router.post("/register", Effect.gen(function* (_) {
    const body = yield* _(Http.request.schemaBodyJson(ShardManagerProtocolHttp.Register_));
    yield* _(shardManager.register(body.pod));
    return yield* _(Http.response.json(true));
  })), Http.router.post("/unregister", Effect.gen(function* (_) {
    const body = yield* _(Http.request.schemaBodyJson(ShardManagerProtocolHttp.Unregister_));
    yield* _(shardManager.unregister(body.pod.address));
    return yield* _(Http.response.json(true));
  })), Http.router.post("/notify-unhealthy-pod", Effect.gen(function* (_) {
    const body = yield* _(Http.request.schemaBodyJson(ShardManagerProtocolHttp.NotifyUnhealthyPod_));
    yield* _(shardManager.notifyUnhealthyPod(body.podAddress));
    return yield* _(Http.response.json(true));
  })), Http.router.get("/get-assignments", Effect.gen(function* (_) {
    const assignments = yield* _(shardManager.getAssignments);
    return yield* _(Http.response.schemaJson(ShardManagerProtocolHttp.GetAssignmentsResult_)(Array.from(assignments)));
  })), Http.router.prefixAll("/api/rest"), Http.server.serve(Http.middleware.logger)));
})).pipe( /*#__PURE__*/Layer.use(internalServer));
exports.shardManagerHttp = shardManagerHttp;
//# sourceMappingURL=ShardManagerHttp.js.map