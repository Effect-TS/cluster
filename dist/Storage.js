"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.noop = exports.memory = exports.TypeId = exports.Storage = void 0;
var _Context = /*#__PURE__*/require("@effect/data/Context");
var HashMap = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashMap"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Layer"));
var Ref = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Ref"));
var Stream = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/stream/Stream"));
var SubscriptionRef = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/stream/SubscriptionRef"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category symbols
 */
const TypeId = /*#__PURE__*/Symbol.for("@effect/sharding/StorageTypeId");
/**
 * @since 1.0.0
 * @category context
 */
exports.TypeId = TypeId;
const Storage = /*#__PURE__*/(0, _Context.Tag)();
/**
 * A layer that stores data in-memory.
 * This is useful for testing with a single pod only.
 *
 * @since 1.0.0
 * @category layers
 */
exports.Storage = Storage;
const memory = /*#__PURE__*/Layer.effect(Storage, /*#__PURE__*/Effect.gen(function* ($) {
  const assignmentsRef = yield* $(SubscriptionRef.make(HashMap.empty()));
  const podsRef = yield* $(Ref.make(HashMap.empty()));
  return {
    getAssignments: SubscriptionRef.get(assignmentsRef),
    saveAssignments: assignments => SubscriptionRef.set(assignments)(assignmentsRef),
    assignmentsStream: assignmentsRef.changes,
    getPods: Ref.get(podsRef),
    savePods: pods => Ref.set(pods)(podsRef)
  };
}));
/**
 * A layer that does nothing, useful for testing.
 *
 * @since 1.0.0
 * @category layers
 */
exports.memory = memory;
const noop = /*#__PURE__*/Layer.effect(Storage, /*#__PURE__*/Effect.succeed({
  getAssignments: /*#__PURE__*/Effect.succeed( /*#__PURE__*/HashMap.empty()),
  saveAssignments: () => Effect.unit,
  assignmentsStream: Stream.empty,
  getPods: /*#__PURE__*/Effect.succeed( /*#__PURE__*/HashMap.empty()),
  savePods: () => Effect.unit
}));
exports.noop = noop;
//# sourceMappingURL=Storage.js.map