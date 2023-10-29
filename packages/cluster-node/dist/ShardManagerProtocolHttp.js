"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Unregister_ = exports.Register_ = exports.NotifyUnhealthyPod_ = exports.GetAssignmentsResult_ = void 0;
var Pod = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/Pod"));
var PodAddress = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/PodAddress"));
var ShardId = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/ShardId"));
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category schema
 */
const Register_ = /*#__PURE__*/Schema.struct({
  pod: Pod.schema
});
/**
 * @since 1.0.0
 * @category schema
 */
exports.Register_ = Register_;
const Unregister_ = /*#__PURE__*/Schema.struct({
  pod: Pod.schema
});
/**
 * @since 1.0.0
 * @category schema
 */
exports.Unregister_ = Unregister_;
const NotifyUnhealthyPod_ = /*#__PURE__*/Schema.struct({
  podAddress: PodAddress.schema
});
/**
 * @since 1.0.0
 * @category schema
 */
exports.NotifyUnhealthyPod_ = NotifyUnhealthyPod_;
const GetAssignmentsResult_ = /*#__PURE__*/Schema.array( /*#__PURE__*/Schema.tuple(ShardId.schema, /*#__PURE__*/Schema.option(PodAddress.schema)));
exports.GetAssignmentsResult_ = GetAssignmentsResult_;
//# sourceMappingURL=ShardManagerProtocolHttp.js.map