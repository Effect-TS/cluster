/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as BinaryMessage from "@effect/shardcake/BinaryMessage";
import * as ByteArray from "@effect/shardcake/ByteArray";
import * as ShardError from "@effect/shardcake/ShardError";
import * as ShardId from "@effect/shardcake/ShardId";
/**
 * @since 1.0.0
 * @category schema
 */
export const AssignShard_ = /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal("AssignShards"),
  shards: /*#__PURE__*/Schema.array(ShardId.schema)
});
/**
 * @since 1.0.0
 * @category schema
 */
export const AssignShardResult_ = /*#__PURE__*/Schema.either(Schema.never, Schema.boolean);
/**
 * @since 1.0.0
 * @category schema
 */
export const UnassignShards_ = /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal("UnassignShards"),
  shards: /*#__PURE__*/Schema.array(ShardId.schema)
});
/**
 * @since 1.0.0
 * @category schema
 */
export const UnassignShardsResult_ = /*#__PURE__*/Schema.either(Schema.never, Schema.boolean);
/**
 * @since 1.0.0
 * @category schema
 */
export const Send_ = /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal("Send"),
  message: BinaryMessage.schema
});
/**
 * @since 1.0.0
 * @category schema
 */
export const SendResult_ = /*#__PURE__*/Schema.either(ShardError.EntityTypeNotRegistered_, /*#__PURE__*/Schema.option(ByteArray.schema));
/**
 * @since 1.0.0
 * @category schema
 */
export const SendStream_ = /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal("SendStream"),
  message: BinaryMessage.schema
});
/**
 * @since 1.0.0
 * @category schema
 */
export const SendStreamResultItem_ = /*#__PURE__*/Schema.either(ShardError.EntityTypeNotRegistered_, ByteArray.schema);
/**
 * @since 1.0.0
 * @category schema
 */
export const PingShards_ = /*#__PURE__*/Schema.struct({
  _tag: /*#__PURE__*/Schema.literal("PingShards")
});
/**
 * @since 1.0.0
 * @category schema
 */
export const PingShardsResult_ = /*#__PURE__*/Schema.either(Schema.never, Schema.boolean);
/**
 * This is the schema for the protocol.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema = /*#__PURE__*/Schema.union(AssignShard_, UnassignShards_, Send_, SendStream_, PingShards_);
//# sourceMappingURL=ShardingProtocolHttp.mjs.map