"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeId = void 0;
exports.isBinaryMessage = isBinaryMessage;
exports.make = make;
exports.schema = void 0;
var Data = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Data"));
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
var ByteArray = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ByteArray"));
var ReplyId = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ReplyId"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category symbols
 */
const TypeId = "@effect/shardcake/BinaryMessage";
/**
 * Construct a new `BinaryMessage`
 *
 * @since 1.0.0
 * @category constructors
 */
exports.TypeId = TypeId;
function make(entityId, entityType, body, replyId) {
  return Data.struct({
    _id: TypeId,
    entityId,
    entityType,
    body,
    replyId
  });
}
/**
 * @since 1.0.0
 * @category utils
 */
function isBinaryMessage(value) {
  return typeof value === "object" && value !== null && "_id" in value && value["_id"] === TypeId;
}
/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
const schema = /*#__PURE__*/Schema.data( /*#__PURE__*/Schema.struct({
  _id: /*#__PURE__*/Schema.literal(TypeId),
  entityId: Schema.string,
  entityType: Schema.string,
  body: ByteArray.schema,
  replyId: /*#__PURE__*/Schema.option(ReplyId.schema)
}));
exports.schema = schema;
//# sourceMappingURL=BinaryMessage.js.map