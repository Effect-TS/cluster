"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeId = void 0;
exports.make = make;
exports.withExpirationFiber = withExpirationFiber;
exports.withoutMessageQueue = withoutMessageQueue;
var Data = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Data"));
var Option = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Option"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 * @category symbols
 */
const TypeId = /*#__PURE__*/Symbol.for("@effect/cluster/EntityState");
/**
 * @since 1.0.0
 * @category constructors
 */
exports.TypeId = TypeId;
function make(data) {
  return Data.struct({
    _id: TypeId,
    ...data
  });
}
/**
 * @since 1.0.0
 * @category modifiers
 */
function withoutMessageQueue(entityState) {
  return {
    ...entityState,
    messageQueue: Option.none()
  };
}
/**
 * @since 1.0.0
 * @category modifiers
 */
function withExpirationFiber(expirationFiber) {
  return entityState => ({
    ...entityState,
    expirationFiber
  });
}
//# sourceMappingURL=EntityState.js.map