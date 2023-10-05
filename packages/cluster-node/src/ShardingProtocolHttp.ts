/**
 * @since 1.0.0
 */
import * as BinaryMessage from "@effect/cluster/BinaryMessage"
import * as ByteArray from "@effect/cluster/ByteArray"
import * as ShardId from "@effect/cluster/ShardId"
import * as ShardingError from "@effect/cluster/ShardingError"
import * as Schema from "@effect/schema/Schema"

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
