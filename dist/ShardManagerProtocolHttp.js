"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.schema = exports.Unregister_ = exports.UnregisterResult_ = exports.Register_ = exports.RegisterResult_ = exports.NotifyUnhealthyPod_ = exports.NotifyUnhealthyPodResult_ = exports.GetAssignments_ = exports.GetAssignmentsResult_ = void 0;
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
var Pod = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/Pod"));
var PodAddress = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/PodAddress"));
var ShardId = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ShardId"));
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
  _tag: /*#__PURE__*/Schema.literal("Register"),
  pod: Pod.schema
});
/**
 * @since 1.0.0
 * @category schema
 */
exports.Register_ = Register_;
const RegisterResult_ = /*#__PURE__*/Schema.either(Schema.never, Schema.boolean);
/**
 * @since 1.0.0
 * @category schema
 */
exports.RegisterResult_ = RegisterResult_;
const Unregister_ = /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal("Unregister"),
  pod: Pod.schema
});
/**
 * @since 1.0.0
 * @category schema
 */
exports.Unregister_ = Unregister_;
const UnregisterResult_ = /*#__PURE__*/Schema.either(Schema.never, Schema.boolean);
/**
 * @since 1.0.0
 * @category schema
 */
exports.UnregisterResult_ = UnregisterResult_;
const NotifyUnhealthyPod_ = /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal("NotifyUnhealthyPod"),
  podAddress: PodAddress.schema
});
/**
 * @since 1.0.0
 * @category schema
 */
exports.NotifyUnhealthyPod_ = NotifyUnhealthyPod_;
const NotifyUnhealthyPodResult_ = /*#__PURE__*/Schema.either(Schema.never, Schema.boolean);
/**
 * @since 1.0.0
 * @category schema
 */
exports.NotifyUnhealthyPodResult_ = NotifyUnhealthyPodResult_;
const GetAssignments_ = /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal("GetAssignments")
});
/**
 * @since 1.0.0
 * @category schema
 */
exports.GetAssignments_ = GetAssignments_;
const GetAssignmentsResult_ = /*#__PURE__*/Schema.either(Schema.never, /*#__PURE__*/Schema.array( /*#__PURE__*/Schema.tuple(ShardId.schema, /*#__PURE__*/Schema.option(PodAddress.schema))));
/**
 * This is the schema for the protocol.
 *
 * @since 1.0.0
 * @category schema
 */
exports.GetAssignmentsResult_ = GetAssignmentsResult_;
const schema = /*#__PURE__*/Schema.union(Register_, Unregister_, NotifyUnhealthyPod_, GetAssignments_);
exports.schema = schema;
//# sourceMappingURL=ShardManagerProtocolHttp.js.map