/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as BinaryMessage from "@effect/sharding/BinaryMessage"
import * as ByteArray from "@effect/sharding/ByteArray"
import * as ShardId from "@effect/sharding/ShardId"
import { ShardingEntityTypeNotRegisteredErrorSchema } from "@effect/sharding/ShardingError"

/**
 * @since 1.0.0
 * @category schema
 */
export const AssignShard_ = Schema.struct({
  _tag: Schema.literal("AssignShards"),
  shards: Schema.array(ShardId.schema)
})

/**
 * @since 1.0.0
 * @category schema
 */
export const AssignShardResult_ = Schema.either(
  Schema.never,
  Schema.boolean
)

/**
 * @since 1.0.0
 * @category schema
 */
export const UnassignShards_ = Schema.struct({
  _tag: Schema.literal("UnassignShards"),
  shards: Schema.array(ShardId.schema)
})

/**
 * @since 1.0.0
 * @category schema
 */
export const UnassignShardsResult_ = Schema.either(
  Schema.never,
  Schema.boolean
)

/**
 * @since 1.0.0
 * @category schema
 */
export const Send_ = Schema.struct({
  _tag: Schema.literal("Send"),
  message: BinaryMessage.schema
})

/**
 * @since 1.0.0
 * @category schema
 */
export const SendResult_ = Schema.either(
  ShardingEntityTypeNotRegisteredErrorSchema,
  Schema.option(ByteArray.schema)
)

/**
 * @since 1.0.0
 * @category schema
 */
export const SendStream_ = Schema.struct({
  _tag: Schema.literal("SendStream"),
  message: BinaryMessage.schema
})

/**
 * @since 1.0.0
 * @category schema
 */
export const SendStreamResultItem_ = Schema.either(
  ShardingEntityTypeNotRegisteredErrorSchema,
  ByteArray.schema
)

/**
 * @since 1.0.0
 * @category schema
 */
export const PingShards_ = Schema.struct({
  _tag: Schema.literal("PingShards")
})

/**
 * @since 1.0.0
 * @category schema
 */
export const PingShardsResult_ = Schema.either(
  Schema.never,
  Schema.boolean
)

/**
 * This is the schema for the protocol.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema = Schema.union(AssignShard_, UnassignShards_, Send_, SendStream_, PingShards_)
