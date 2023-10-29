"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShardingErrorPodNoLongerRegistered = ShardingErrorPodNoLongerRegistered;
exports.ShardingErrorPodNoLongerRegisteredTag = exports.ShardingErrorPodNoLongerRegisteredSchema = void 0;
exports.isShardingErrorPodNoLongerRegistered = isShardingErrorPodNoLongerRegistered;
var PodAddress = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/PodAddress"));
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
var Data = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Data"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category symbols
 */
const ShardingErrorPodNoLongerRegisteredTag = "@effect/cluster/ShardingErrorPodNoLongerRegistered";
exports.ShardingErrorPodNoLongerRegisteredTag = ShardingErrorPodNoLongerRegisteredTag;
const ShardingErrorPodNoLongerRegisteredSchema_ = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingErrorPodNoLongerRegisteredTag),
  podAddress: PodAddress.schema
}));
/**
 * @since 1.0.0
 * @category constructors
 */
function ShardingErrorPodNoLongerRegistered(podAddress) {
  return Data.struct({
    _tag: ShardingErrorPodNoLongerRegisteredTag,
    podAddress
  });
}
/**
 * @since 1.0.0
 * @category constructors
 */
function isShardingErrorPodNoLongerRegistered(value) {
  return typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === ShardingErrorPodNoLongerRegisteredTag;
}
/**
 * @since 1.0.0
 * @category schema
 */
const ShardingErrorPodNoLongerRegisteredSchema = ShardingErrorPodNoLongerRegisteredSchema_;
exports.ShardingErrorPodNoLongerRegisteredSchema = ShardingErrorPodNoLongerRegisteredSchema;
//# sourceMappingURL=ShardingErrorPodNoLongerRegistered.js.map