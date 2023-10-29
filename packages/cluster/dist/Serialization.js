"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.json = exports.TypeId = exports.Serialization = void 0;
var SerializedMessage = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/SerializedMessage"));
var ShardingError = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/ShardingError"));
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
var TreeFormatter = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/TreeFormatter"));
var _Context = /*#__PURE__*/require("effect/Context");
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Effect"));
var _Function = /*#__PURE__*/require("effect/Function");
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Layer"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category symbols
 */
const TypeId = /*#__PURE__*/Symbol.for("@effect/cluster/SerializationTypeId");
/**
 * @since 1.0.0
 * @category context
 */
exports.TypeId = TypeId;
const Serialization = /*#__PURE__*/(0, _Context.Tag)();
/** @internal */
exports.Serialization = Serialization;
function jsonStringify(value, schema) {
  return (0, _Function.pipe)(value, Schema.encode(schema), Effect.mapError(e => ShardingError.ShardingErrorSerialization(TreeFormatter.formatErrors(e.errors))), Effect.map(_ => JSON.stringify(_)));
}
/** @internal */
function jsonParse(value, schema) {
  return (0, _Function.pipe)(Effect.sync(() => JSON.parse(value)), Effect.flatMap(Schema.decode(schema)), Effect.mapError(e => ShardingError.ShardingErrorSerialization(TreeFormatter.formatErrors(e.errors))));
}
/**
 * A layer that uses Java serialization for encoding and decoding messages.
 * This is useful for testing and not recommended to use in production.
 * @since 1.0.0
 * @category layers
 */
const json = /*#__PURE__*/Layer.succeed(Serialization, {
  _id: TypeId,
  encode: (schema, message) => (0, _Function.pipe)(jsonStringify(message, schema), Effect.map(SerializedMessage.make)),
  decode: (schema, body) => jsonParse(body.value, schema)
});
exports.json = json;
//# sourceMappingURL=Serialization.js.map