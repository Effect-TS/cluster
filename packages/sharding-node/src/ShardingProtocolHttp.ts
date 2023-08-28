/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as BinaryMessage from "@effect/sharding/BinaryMessage"
import * as ByteArray from "@effect/sharding/ByteArray"
import * as ShardId from "@effect/sharding/ShardId"
import * as ShardingError from "@effect/sharding/ShardingError"

/**
 * @since 1.0.0
 * @category schema
 */
export const AssignShard_ = Schema.struct({
  shards: Schema.array(ShardId.schema)
})

/**
 * @since 1.0.0
 * @category schema
 */
export const UnassignShards_ = Schema.struct({
  shards: Schema.array(ShardId.schema)
})

/**
 * @since 1.0.0
 * @category schema
 */
export const Send_ = Schema.struct({
  message: BinaryMessage.schema
})

/**
 * @since 1.0.0
 * @category schema
 */
export const SendResult_ = Schema.either(
  ShardingError.schema,
  Schema.option(ByteArray.schema)
)

/**
 * @since 1.0.0
 * @category schema
 */
export const SendStream_ = Schema.struct({
  message: BinaryMessage.schema
})

/**
 * @since 1.0.0
 * @category schema
 */
export const SendStreamResultItem_ = Schema.either(
  ShardingError.schema,
  ByteArray.schema
)

/**
 * @since 1.0.0
 * @category schema
 */
export const PingShards_ = Schema.struct({})

/**
 * This is the schema for the protocol.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema = Schema.union(AssignShard_, UnassignShards_, Send_, SendStream_, PingShards_)
