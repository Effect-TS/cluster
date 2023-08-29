"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ShardingPodNoLongerRegisteredError = ShardingPodNoLongerRegisteredError;
exports.ShardingPodNoLongerRegisteredErrorTag = exports.ShardingPodNoLongerRegisteredErrorSchema = void 0;
exports.isShardingPodNoLongerRegisteredError = isShardingPodNoLongerRegisteredError;
var Data = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Data"));
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
var PodAddress = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/PodAddress"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category symbols
 */
const ShardingPodNoLongerRegisteredErrorTag = "@effect/sharding/ShardingPodNoLongerRegisteredError";
exports.ShardingPodNoLongerRegisteredErrorTag = ShardingPodNoLongerRegisteredErrorTag;
const ShardingPodNoLongerRegisteredErrorSchema_ = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal(ShardingPodNoLongerRegisteredErrorTag),
  podAddress: PodAddress.schema
}));
/**
 * @since 1.0.0
 * @category constructors
 */
function ShardingPodNoLongerRegisteredError(podAddress) {
  return Data.struct({
    _tag: ShardingPodNoLongerRegisteredErrorTag,
    podAddress
  });
}
/**
 * @since 1.0.0
 * @category constructors
 */
function isShardingPodNoLongerRegisteredError(value) {
  return typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === ShardingPodNoLongerRegisteredErrorTag;
}
/**
 * @since 1.0.0
 * @category schema
 */
const ShardingPodNoLongerRegisteredErrorSchema = ShardingPodNoLongerRegisteredErrorSchema_;
exports.ShardingPodNoLongerRegisteredErrorSchema = ShardingPodNoLongerRegisteredErrorSchema;
//# sourceMappingURL=ShardingPodNoLongerRegisteredError.js.map