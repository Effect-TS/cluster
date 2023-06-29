import * as Schema from "@effect/schema/Schema"
import * as BinaryMessage from "@effect/shardcake/BinaryMessage"
import * as ByteArray from "@effect/shardcake/ByteArray"
import * as ShardError from "@effect/shardcake/ShardError"
import * as ShardId from "@effect/shardcake/ShardId"

export const AssignShard_ = Schema.struct({
  _tag: Schema.literal("AssignShards"),
  shards: Schema.array(ShardId.schema)
})

export const UnassignShards_ = Schema.struct({
  _tag: Schema.literal("UnassignShards"),
  shards: Schema.array(ShardId.schema)
})

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

export const schema = Schema.union(AssignShard_, UnassignShards_, Send_, PingShards_)
