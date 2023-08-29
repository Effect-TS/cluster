/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema";
import * as BinaryMessage from "@effect/sharding/BinaryMessage";
import * as ByteArray from "@effect/sharding/ByteArray";
import * as ShardId from "@effect/sharding/ShardId";
import * as ShardingError from "@effect/sharding/ShardingError";
/**
 * @since 1.0.0
 * @category schema
 */
export const AssignShard_ = /*#__PURE__*/Schema.struct({
  shards: /*#__PURE__*/Schema.array(ShardId.schema)
});
/**
 * @since 1.0.0
 * @category schema
 */
export const UnassignShards_ = /*#__PURE__*/Schema.struct({
  shards: /*#__PURE__*/Schema.array(ShardId.schema)
});
/**
 * @since 1.0.0
 * @category schema
 */
export const Send_ = /*#__PURE__*/Schema.struct({
  message: BinaryMessage.schema
});
/**
 * @since 1.0.0
 * @category schema
 */
export const SendResult_ = /*#__PURE__*/Schema.either(ShardingError.schema, /*#__PURE__*/Schema.option(ByteArray.schema));
/**
 * @since 1.0.0
 * @category schema
 */
export const SendStream_ = /*#__PURE__*/Schema.struct({
  message: BinaryMessage.schema
});
/**
 * @since 1.0.0
 * @category schema
 */
export const SendStreamResultItem_ = /*#__PURE__*/Schema.either(ShardingError.schema, ByteArray.schema);
/**
 * @since 1.0.0
 * @category schema
 */
export const PingShards_ = /*#__PURE__*/Schema.struct({});
/**
 * This is the schema for the protocol.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema = /*#__PURE__*/Schema.union(AssignShard_, UnassignShards_, Send_, SendStream_, PingShards_);
//# sourceMappingURL=ShardingProtocolHttp.mjs.map