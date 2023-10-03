"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeId = void 0;
exports.isReplyId = isReplyId;
exports.make = make;
exports.schema = exports.makeEffect = void 0;
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
var crypto = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("crypto"));
var Data = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Data"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Effect"));
var _Function = /*#__PURE__*/require("effect/Function");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category symbols
 */
const TypeId = "@effect/sharding/ReplyId";
/**
 * @since 1.0.0
 * @category utils
 */
exports.TypeId = TypeId;
function isReplyId(value) {
  return typeof value === "object" && value !== null && "_id" in value && value["_id"] === TypeId;
}
/**
 * Construct a new `ReplyId` from its internal id string value.
 *
 * @since 1.0.0
 * @category constructors
 */
function make(value) {
  return Data.struct({
    _id: TypeId,
    value
  });
}
/** @internal */
const makeUUID = typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function" ? /*#__PURE__*/Effect.sync(() =>
// @ts-expect-error
([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))) : /*#__PURE__*/Effect.sync(() => (Math.random() * 10000).toString(36));
/**
 * Construct a new `ReplyId` by internally building a UUID.
 *
 * @since 1.0.0
 * @category constructors
 */
const makeEffect = /*#__PURE__*/(0, _Function.pipe)(makeUUID, /*#__PURE__*/Effect.map(make));
/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
exports.makeEffect = makeEffect;
const schema = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _id: /*#__PURE__*/Schema.literal(TypeId),
  value: Schema.string
}));
exports.schema = schema;
//# sourceMappingURL=ReplyId.js.map