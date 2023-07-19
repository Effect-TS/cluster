"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.local = exports.ShardManagerClient = void 0;
var _Context = /*#__PURE__*/require("@effect/data/Context");
var _Function = /*#__PURE__*/require("@effect/data/Function");
var HashMap = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashMap"));
var Option = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Option"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Layer"));
var PodAddress = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/PodAddress"));
var ShardId = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ShardId"));
var ShardingConfig = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ShardingConfig"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category context
 */
const ShardManagerClient = /*#__PURE__*/(0, _Context.Tag)();
/**
 * @since 1.0.0
 * @category layers
 */
exports.ShardManagerClient = ShardManagerClient;
const local = /*#__PURE__*/(0, _Function.pipe)( /*#__PURE__*/Layer.effect(ShardManagerClient, /*#__PURE__*/Effect.gen(function* ($) {
  const config = yield* $(ShardingConfig.ShardingConfig);
  const pod = PodAddress.make(config.selfHost, config.shardingPort);
  let shards = HashMap.empty();
  for (let i = 0; i < config.numberOfShards; i++) {
    shards = HashMap.set(shards, ShardId.make(i), Option.some(pod));
  }
  return {
    register: () => Effect.unit,
    unregister: () => Effect.unit,
    notifyUnhealthyPod: () => Effect.unit,
    getAssignments: Effect.succeed(shards)
  };
})));
exports.local = local;
//# sourceMappingURL=ShardManagerClient.js.map