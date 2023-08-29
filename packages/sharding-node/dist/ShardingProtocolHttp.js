"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.schema = exports.UnassignShards_ = exports.Send_ = exports.SendStream_ = exports.SendStreamResultItem_ = exports.SendResult_ = exports.PingShards_ = exports.AssignShard_ = void 0;
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
var BinaryMessage = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/BinaryMessage"));
var ByteArray = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ByteArray"));
var ShardId = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ShardId"));
var ShardingError = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ShardingError"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category schema
 */
const AssignShard_ = /*#__PURE__*/Schema.struct({
  shards: /*#__PURE__*/Schema.array(ShardId.schema)
});
/**
 * @since 1.0.0
 * @category schema
 */
exports.AssignShard_ = AssignShard_;
const UnassignShards_ = /*#__PURE__*/Schema.struct({
  shards: /*#__PURE__*/Schema.array(ShardId.schema)
});
/**
 * @since 1.0.0
 * @category schema
 */
exports.UnassignShards_ = UnassignShards_;
const Send_ = /*#__PURE__*/Schema.struct({
  message: BinaryMessage.schema
});
/**
 * @since 1.0.0
 * @category schema
 */
exports.Send_ = Send_;
const SendResult_ = /*#__PURE__*/Schema.either(ShardingError.schema, /*#__PURE__*/Schema.option(ByteArray.schema));
/**
 * @since 1.0.0
 * @category schema
 */
exports.SendResult_ = SendResult_;
const SendStream_ = /*#__PURE__*/Schema.struct({
  message: BinaryMessage.schema
});
/**
 * @since 1.0.0
 * @category schema
 */
exports.SendStream_ = SendStream_;
const SendStreamResultItem_ = /*#__PURE__*/Schema.either(ShardingError.schema, ByteArray.schema);
/**
 * @since 1.0.0
 * @category schema
 */
exports.SendStreamResultItem_ = SendStreamResultItem_;
const PingShards_ = /*#__PURE__*/Schema.struct({});
/**
 * This is the schema for the protocol.
 *
 * @since 1.0.0
 * @category schema
 */
exports.PingShards_ = PingShards_;
const schema = /*#__PURE__*/Schema.union(AssignShard_, UnassignShards_, Send_, SendStream_, PingShards_);
exports.schema = schema;
//# sourceMappingURL=ShardingProtocolHttp.js.map