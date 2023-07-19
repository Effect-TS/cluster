"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.json = exports.TypeId = exports.Serialization = void 0;
var _Context = /*#__PURE__*/require("@effect/data/Context");
var _Function = /*#__PURE__*/require("@effect/data/Function");
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Layer"));
var ByteArray = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ByteArray"));
var ShardError = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ShardError"));
var _utils = /*#__PURE__*/require("./utils");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category symbols
 */
const TypeId = /*#__PURE__*/Symbol.for("@effect/shardcake/SerializationTypeId");
/**
 * @since 1.0.0
 * @category context
 */
exports.TypeId = TypeId;
const Serialization = /*#__PURE__*/(0, _Context.Tag)();
/**
 * A layer that uses Java serialization for encoding and decoding messages.
 * This is useful for testing and not recommended to use in production.
 * @since 1.0.0
 * @category layers
 */
exports.Serialization = Serialization;
const json = /*#__PURE__*/Layer.succeed(Serialization, {
  [TypeId]: {},
  encode: (message, schema) => (0, _Function.pipe)((0, _utils.jsonStringify)(message, schema), Effect.mapError(ShardError.EncodeError), Effect.map(ByteArray.make)),
  decode: (body, schema) => (0, _Function.pipe)((0, _utils.jsonParse)(body.value, schema), Effect.mapError(ShardError.DecodeError))
});
exports.json = json;
//# sourceMappingURL=Serialization.js.map