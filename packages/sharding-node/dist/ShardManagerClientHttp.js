"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.shardManagerClientHttp = void 0;
var Http = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/platform/HttpClient"));
var ShardManagerProtocolHttp = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding-node/ShardManagerProtocolHttp"));
var Pod = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/Pod"));
var ShardingConfig = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ShardingConfig"));
var ShardManagerClient = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ShardManagerClient"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Effect"));
var _Function = /*#__PURE__*/require("effect/Function");
var HashMap = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/HashMap"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Layer"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category layers
 */
const shardManagerClientHttp = /*#__PURE__*/Layer.effect(ShardManagerClient.ShardManagerClient, Effect.gen(function* (_) {
  const config = yield* _(ShardingConfig.ShardingConfig);
  const client = yield* _(Http.client.Client, Effect.map(Http.client.filterStatusOk));
  return {
    register: podAddress => Effect.gen(function* (_) {
      const request = yield* _(Http.request.post("/register"), Http.request.prependUrl(config.shardManagerUri), Http.request.schemaBody(ShardManagerProtocolHttp.Register_)({
        pod: Pod.make(podAddress, config.serverVersion)
      }));
      return yield* _(client(request));
    }).pipe(Effect.orDie),
    unregister: podAddress => Effect.gen(function* (_) {
      const request = yield* _(Http.request.post("/unregister"), Http.request.prependUrl(config.shardManagerUri), Http.request.schemaBody(ShardManagerProtocolHttp.Unregister_)({
        pod: Pod.make(podAddress, config.serverVersion)
      }));
      return yield* _(client(request));
    }).pipe(Effect.orDie),
    notifyUnhealthyPod: podAddress => Effect.gen(function* (_) {
      const request = yield* _(Http.request.post("/notify-unhealthy-pod"), Http.request.prependUrl(config.shardManagerUri), Http.request.schemaBody(ShardManagerProtocolHttp.NotifyUnhealthyPod_)({
        podAddress
      }));
      return yield* _(client(request));
    }).pipe(Effect.orDie),
    getAssignments: Effect.gen(function* (_) {
      const request = (0, _Function.pipe)(Http.request.get("/get-assignments"), Http.request.prependUrl(config.shardManagerUri));
      const response = yield* _(client(request), Effect.flatMap(Http.response.schemaBodyJson(ShardManagerProtocolHttp.GetAssignmentsResult_)));
      return HashMap.fromIterable(response);
    }).pipe(Effect.orDie)
  };
})).pipe( /*#__PURE__*/Layer.use(Http.client.layer));
exports.shardManagerClientHttp = shardManagerClientHttp;
//# sourceMappingURL=ShardManagerClientHttp.js.map