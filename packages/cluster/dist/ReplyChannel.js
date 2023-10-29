"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeId = void 0;
exports.fromDeferred = fromDeferred;
exports.isReplyChannel = isReplyChannel;
exports.make = void 0;
var Deferred = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Deferred"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Effect"));
var _Function = /*#__PURE__*/require("effect/Function");
var Option = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Option"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 * @category symbols
 */
const TypeId = "@effect/cluster/ReplyChannel";
/**
 * @since 1.0.0
 * @category utils
 */
exports.TypeId = TypeId;
function isReplyChannel(value) {
  return typeof value === "object" && value !== null && "_id" in value && value["_id"] === TypeId;
}
/**
 * Construct a new `ReplyChannel` from a deferred.
 *
 * @internal
 */
function fromDeferred(deferred) {
  const fail = cause => (0, _Function.pipe)(Deferred.failCause(deferred, cause), Effect.asUnit);
  return {
    _id: TypeId,
    await: (0, _Function.pipe)(Deferred.await(deferred), Effect.exit, Effect.asUnit),
    fail,
    reply: a => (0, _Function.pipe)(Deferred.succeed(deferred, Option.some(a)), Effect.asUnit),
    output: (0, _Function.pipe)(Deferred.await(deferred), Effect.onError(fail))
  };
}
/** @internal */
const make = () => (0, _Function.pipe)(Deferred.make(), Effect.map(fromDeferred));
exports.make = make;
//# sourceMappingURL=ReplyChannel.js.map