"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.noop = exports.local = exports.TypeId = exports.PodsHealth = void 0;
var _Context = /*#__PURE__*/require("@effect/data/Context");
var Option = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Option"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Layer"));
var Pods = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/Pods"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category symbols
 */
const TypeId = /*#__PURE__*/Symbol.for("@effect/shardcake/PodsHealth");
/**
 * @since 1.0.0
 * @category context
 */
exports.TypeId = TypeId;
const PodsHealth = /*#__PURE__*/(0, _Context.Tag)();
/**
 * A layer that considers pods as always alive.
 * This is useful for testing only.
 * @since 1.0.0
 * @category layers
 */
exports.PodsHealth = PodsHealth;
const noop = /*#__PURE__*/Layer.succeed(PodsHealth, {
  [TypeId]: {},
  isAlive: () => Effect.succeed(true)
});
/**
 * A layer that pings the pod directly to check if it's alive.
 * This is useful for developing and testing but not reliable in production.
 * @since 1.0.0
 * @category layers
 */
exports.noop = noop;
const local = /*#__PURE__*/Layer.effect(PodsHealth, /*#__PURE__*/Effect.map(Pods.Pods, podApi => ({
  [TypeId]: {},
  isAlive: address => Effect.map(Option.isSome)(Effect.option(podApi.ping(address)))
})));
exports.local = local;
//# sourceMappingURL=PodsHealth.js.map