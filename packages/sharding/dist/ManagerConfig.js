"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaults = exports.ManagerConfig = void 0;
var _Context = /*#__PURE__*/require("effect/Context");
var Duration = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Duration"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Layer"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category context
 */
const ManagerConfig = /*#__PURE__*/(0, _Context.Tag)();
/**
 * @since 1.0.0
 * @category utils
 */
exports.ManagerConfig = ManagerConfig;
const defaults = /*#__PURE__*/Layer.succeed(ManagerConfig, {
  numberOfShards: 300,
  apiPort: 8080,
  rebalanceInterval: /*#__PURE__*/Duration.seconds(20),
  rebalanceRetryInterval: /*#__PURE__*/Duration.seconds(10),
  pingTimeout: /*#__PURE__*/Duration.seconds(3),
  persistRetryInterval: /*#__PURE__*/Duration.seconds(3),
  persistRetryCount: 100,
  rebalanceRate: 2 / 100
});
exports.defaults = defaults;
//# sourceMappingURL=ManagerConfig.js.map