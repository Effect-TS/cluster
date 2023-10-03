"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeId = void 0;
exports.isPod = isPod;
exports.make = make;
exports.schema = void 0;
exports.show = show;
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
var PodAddress = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/PodAddress"));
var Data = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Data"));
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
const TypeId = "@effect/sharding/Pod";
/**
 * @since 1.0.0
 * @category utils
 */
exports.TypeId = TypeId;
function isPod(value) {
  return typeof value === "object" && value !== null && "_id" in value && value["_id"] === TypeId;
}
/**
 * @since 1.0.0
 * @category constructors
 */
function make(address, version) {
  return Data.struct({
    _id: TypeId,
    address,
    version
  });
}
/** @internal */
function show(value) {
  return "Pod(address=" + value.address + ", version=" + value.version + ")";
}
/**
 * @since 1.0.0
 * @category schema
 */
const schema = /*#__PURE__*/(0, _Function.pipe)( /*#__PURE__*/Schema.struct({
  _id: /*#__PURE__*/Schema.literal(TypeId),
  address: PodAddress.schema,
  version: Schema.string
}), Schema.data);
exports.schema = schema;
//# sourceMappingURL=Pod.js.map