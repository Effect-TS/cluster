"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.schema = exports.UnassignShards_ = exports.UnassignShardsResult_ = exports.Send_ = exports.SendStream_ = exports.SendStreamResultItem_ = exports.SendResult_ = exports.PingShards_ = exports.PingShardsResult_ = exports.AssignShard_ = exports.AssignShardResult_ = void 0;
var Schema = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/schema/Schema"));
var BinaryMessage = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/BinaryMessage"));
var ByteArray = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ByteArray"));
var ShardId = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ShardId"));
var _ShardingError = /*#__PURE__*/require("@effect/shardcake/ShardingError");
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
  _tag: /*#__PURE__*/Schema.literal("AssignShards"),
  shards: /*#__PURE__*/Schema.array(ShardId.schema)
});
/**
 * @since 1.0.0
 * @category schema
 */
exports.AssignShard_ = AssignShard_;
const AssignShardResult_ = /*#__PURE__*/Schema.either(Schema.never, Schema.boolean);
/**
 * @since 1.0.0
 * @category schema
 */
exports.AssignShardResult_ = AssignShardResult_;
const UnassignShards_ = /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal("UnassignShards"),
  shards: /*#__PURE__*/Schema.array(ShardId.schema)
});
/**
 * @since 1.0.0
 * @category schema
 */
exports.UnassignShards_ = UnassignShards_;
const UnassignShardsResult_ = /*#__PURE__*/Schema.either(Schema.never, Schema.boolean);
/**
 * @since 1.0.0
 * @category schema
 */
exports.UnassignShardsResult_ = UnassignShardsResult_;
const Send_ = /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal("Send"),
  message: BinaryMessage.schema
});
/**
 * @since 1.0.0
 * @category schema
 */
exports.Send_ = Send_;
const SendResult_ = /*#__PURE__*/Schema.either(_ShardingError.ShardingEntityTypeNotRegisteredErrorSchema, /*#__PURE__*/Schema.option(ByteArray.schema));
/**
 * @since 1.0.0
 * @category schema
 */
exports.SendResult_ = SendResult_;
const SendStream_ = /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal("SendStream"),
  message: BinaryMessage.schema
});
/**
 * @since 1.0.0
 * @category schema
 */
exports.SendStream_ = SendStream_;
const SendStreamResultItem_ = /*#__PURE__*/Schema.either(_ShardingError.ShardingEntityTypeNotRegisteredErrorSchema, ByteArray.schema);
/**
 * @since 1.0.0
 * @category schema
 */
exports.SendStreamResultItem_ = SendStreamResultItem_;
const PingShards_ = /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal("PingShards")
});
/**
 * @since 1.0.0
 * @category schema
 */
exports.PingShards_ = PingShards_;
const PingShardsResult_ = /*#__PURE__*/Schema.either(Schema.never, Schema.boolean);
/**
 * This is the schema for the protocol.
 *
 * @since 1.0.0
 * @category schema
 */
exports.PingShardsResult_ = PingShardsResult_;
const schema = /*#__PURE__*/Schema.union(AssignShard_, UnassignShards_, Send_, SendStream_, PingShards_);
exports.schema = schema;
//# sourceMappingURL=ShardingProtocolHttp.js.map