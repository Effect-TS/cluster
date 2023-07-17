"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DecodeError = DecodeError;
exports.EncodeError = EncodeError;
exports.EntityNotManagedByThisPod = EntityNotManagedByThisPod;
exports.EntityTypeNotRegistered = EntityTypeNotRegistered;
exports.EntityTypeNotRegistered_ = void 0;
exports.FetchError = FetchError;
exports.MessageReturnedNoting = MessageReturnedNoting;
exports.NotAMessageWithReplier = NotAMessageWithReplier;
exports.PodNoLongerRegistered = PodNoLongerRegistered;
exports.PodUnavailable = PodUnavailable;
exports.ReplyFailure = ReplyFailure;
exports.SendError = SendError;
exports.SendTimeoutException = SendTimeoutException;
exports.isEntityNotManagedByThisPodError = isEntityNotManagedByThisPodError;
exports.isEntityTypeNotRegistered = isEntityTypeNotRegistered;
exports.isFetchError = isFetchError;
exports.isPodUnavailableError = isPodUnavailableError;
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
var PodAddress = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/PodAddress"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category constructors
 */
function DecodeError(error) {
  return {
    _tag: "DecodeError",
    error
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
function EncodeError(error) {
  return {
    _tag: "EncodeError",
    error
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
function ReplyFailure(error) {
  return {
    _tag: "ReplyFailure",
    error
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
function SendError() {
  return {
    _tag: "SendError"
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
function SendTimeoutException(entityType, entityId, body) {
  return {
    _tag: "SendTimeoutException",
    entityId,
    entityType,
    body
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
function EntityNotManagedByThisPod(entityId) {
  return {
    _tag: "EntityNotManagedByThisPod",
    entityId
  };
}
/**
 * @since 1.0.0
 * @category utils
 */
function isEntityNotManagedByThisPodError(value) {
  return value && "_tag" in value && value._tag === "EntityNotManagedByThisPod";
}
/**
 * @since 1.0.0
 * @category constructors
 */
function PodUnavailable(pod) {
  return {
    _tag: "PodUnavailable",
    pod
  };
}
/**
 * @since 1.0.0
 * @category utils
 */
function isPodUnavailableError(value) {
  return value && "_tag" in value && value._tag === "PodUnavailable";
}
/**
 * @since 1.0.0
 * @category schema
 */
const EntityTypeNotRegistered_ = /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal("EntityTypeNotRegistered"),
  entityType: Schema.string,
  podAddress: PodAddress.schema
});
/**
 * @since 1.0.0
 * @category constructors
 */
exports.EntityTypeNotRegistered_ = EntityTypeNotRegistered_;
function EntityTypeNotRegistered(entityType, podAddress) {
  return {
    _tag: "EntityTypeNotRegistered",
    entityType,
    podAddress
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
function isEntityTypeNotRegistered(value) {
  return typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "EntityTypeNotRegistered";
}
/**
 * @since 1.0.0
 * @category constructors
 */
function MessageReturnedNoting(entityId, msg) {
  return {
    _tag: "MessageReturnedNoting",
    entityId,
    msg
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
function PodNoLongerRegistered(pod) {
  return {
    _tag: "PodNoLongerRegistered",
    pod
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
function NotAMessageWithReplier(value) {
  return {
    _tag: "NotAMessageWithReplier",
    value
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
function FetchError(url, body, error) {
  return {
    _tag: "@effect/shardcake/FetchError",
    url,
    body,
    error
  };
}
/**
 * @since 1.0.0
 * @category utils
 */
function isFetchError(value) {
  return typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "@effect/shardcake/FetchError";
}
//# sourceMappingURL=ShardError.js.map