"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeId = void 0;
exports.compareVersion = compareVersion;
exports.extractVersion = extractVersion;
exports.isPodWithMetadata = isPodWithMetadata;
exports.make = make;
exports.schema = void 0;
exports.show = show;
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
var Pod = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/Pod"));
var Data = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Data"));
var _Function = /*#__PURE__*/require("effect/Function");
var List = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/List"));
var Option = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Option"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category symbols
 */
const TypeId = "@effect/sharding/PodWithMetadata";
/**
 * @since 1.0.0
 * @category utils
 */
exports.TypeId = TypeId;
function isPodWithMetadata(value) {
  return typeof value === "object" && value !== null && "_id" in value && value["_id"] === TypeId;
}
/**
 * @since 1.0.0
 * @category constructors
 */
function make(pod, registered) {
  return Data.struct({
    _id: TypeId,
    pod,
    registered
  });
}
/**
 * @since 1.0.0
 * @category utils
 */
function extractVersion(pod) {
  return (0, _Function.pipe)(List.fromIterable(pod.pod.version.split(".")), List.map(_ => parseInt(_, 10)));
}
/**
 * @since 1.0.0
 * @category utils
 */
function compareVersion(a, b) {
  let restA = a;
  let restB = b;
  while (List.size(restA) > 0 || List.size(restB) > 0) {
    const numA = (0, _Function.pipe)(List.head(restA), Option.getOrElse(() => 0));
    const numB = (0, _Function.pipe)(List.head(restB), Option.getOrElse(() => 0));
    if (numA < numB) return -1;
    if (numB > numA) return 1;
    restA = (0, _Function.pipe)(List.tail(restA), Option.getOrElse(() => List.empty()));
    restB = (0, _Function.pipe)(List.tail(restB), Option.getOrElse(() => List.empty()));
  }
  return 0;
}
/** @internal */
function show(value) {
  return "PodWithMetadata(pod=" + Pod.show(value.pod) + ", registered=" + value.registered + ")";
}
/**
 * @since 1.0.0
 * @category schema
 */
const schema = /*#__PURE__*/(0, _Function.pipe)( /*#__PURE__*/Schema.struct({
  _id: /*#__PURE__*/Schema.literal(TypeId),
  pod: Pod.schema,
  registered: Schema.number
}), Schema.data);
exports.schema = schema;
//# sourceMappingURL=PodWithMetadata.js.map