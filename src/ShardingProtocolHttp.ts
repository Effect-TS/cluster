import * as Schema from "@effect/schema/Schema"
import * as BinaryMessage from "@effect/shardcake/BinaryMessage"
import * as ByteArray from "@effect/shardcake/ByteArray"
import * as ShardError from "@effect/shardcake/ShardError"
import * as ShardId from "@effect/shardcake/ShardId"

export const AssignShard_ = Schema.struct({
  _tag: Schema.literal("AssignShards"),
  shards: Schema.array(ShardId.schema)
})
export const AssignShardResult_ = Schema.either(
  Schema.never,
  Schema.boolean
)

export const UnassignShards_ = Schema.struct({
  _tag: Schema.literal("UnassignShards"),
  shards: Schema.array(ShardId.schema)
})
export const UnassignShardsResult_ = Schema.either(
  Schema.never,
  Schema.boolean
)

export const Send_ = Schema.struct({
  _tag: Schema.literal("Send"),
  message: BinaryMessage.schema
})
export const SendResult_ = Schema.either(
  ShardError.EntityTypeNotRegistered_,
  Schema.option(ByteArray.schema)
)

export const PingShards_ = Schema.struct({
  _tag: Schema.literal("PingShards")
})
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
export const schema = Schema.union(AssignShard_, UnassignShards_, Send_, PingShards_)
