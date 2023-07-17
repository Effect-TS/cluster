/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as PodAddress from "@effect/shardcake/PodAddress";
/**
 * @since 1.0.0
 * @category constructors
 */
export function DecodeError(error) {
  return {
    _tag: "DecodeError",
    error
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function EncodeError(error) {
  return {
    _tag: "EncodeError",
    error
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function ReplyFailure(error) {
  return {
    _tag: "ReplyFailure",
    error
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function SendError() {
  return {
    _tag: "SendError"
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function SendTimeoutException(entityType, entityId, body) {
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
export function EntityNotManagedByThisPod(entityId) {
  return {
    _tag: "EntityNotManagedByThisPod",
    entityId
  };
}
/**
 * @since 1.0.0
 * @category utils
 */
export function isEntityNotManagedByThisPodError(value) {
  return value && "_tag" in value && value._tag === "EntityNotManagedByThisPod";
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function PodUnavailable(pod) {
  return {
    _tag: "PodUnavailable",
    pod
  };
}
/**
 * @since 1.0.0
 * @category utils
 */
export function isPodUnavailableError(value) {
  return value && "_tag" in value && value._tag === "PodUnavailable";
}
/**
 * @since 1.0.0
 * @category schema
 */
export const EntityTypeNotRegistered_ = /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal("EntityTypeNotRegistered"),
  entityType: Schema.string,
  podAddress: PodAddress.schema
});
/**
 * @since 1.0.0
 * @category constructors
 */
export function EntityTypeNotRegistered(entityType, podAddress) {
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
export function isEntityTypeNotRegistered(value) {
  return typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "EntityTypeNotRegistered";
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function MessageReturnedNoting(entityId, msg) {
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
export function PodNoLongerRegistered(pod) {
  return {
    _tag: "PodNoLongerRegistered",
    pod
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function NotAMessageWithReplier(value) {
  return {
    _tag: "NotAMessageWithReplier",
    value
  };
}
/**
 * @since 1.0.0
 * @category constructors
 */
export function FetchError(url, body, error) {
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
export function isFetchError(value) {
  return typeof value === "object" && value !== null && "_tag" in value && value["_tag"] === "@effect/shardcake/FetchError";
}
//# sourceMappingURL=ShardError.mjs.map