/**
 * @since 1.0.0
 */
import * as MessageState from "@effect/cluster/MessageState"
import * as SerializedEnvelope from "@effect/cluster/SerializedEnvelope"
import * as SerializedMessage from "@effect/cluster/SerializedMessage"
import * as ShardId from "@effect/cluster/ShardId"
import * as ShardingException from "@effect/cluster/ShardingException"
import * as Schema from "@effect/schema/Schema"

/**
 * @since 1.0.0
 * @category schema
 */
export const AssignShard_: Schema.Schema<
  { readonly shards: ReadonlyArray<ShardId.ShardId> },
  {
    readonly shards: ReadonlyArray<
      { readonly "@effect/cluster/ShardId": "@effect/cluster/ShardId"; readonly value: number }
    >
  }
> = Schema.struct({
  shards: Schema.array(ShardId.schema)
})

/**
 * @since 1.0.0
 * @category schema
 */
export const UnassignShards_: Schema.Schema<
  { readonly shards: ReadonlyArray<ShardId.ShardId> },
  { readonly shards: ReadonlyArray<ShardId.ShardId.From> }
> = Schema.struct({
  shards: Schema.array(ShardId.schema)
})

/**
 * @since 1.0.0
 * @category schema
 */
export const Send_: Schema.Schema<
  { readonly message: SerializedEnvelope.SerializedEnvelope },
  { readonly message: SerializedEnvelope.SerializedEnvelope.From }
> = Schema.struct({
  message: SerializedEnvelope.schema
})

/**
 * @since 1.0.0
 * @category schema
 */
export const SendResult_ = Schema.either({
  left: ShardingException.schema,
  right: MessageState.schema(SerializedMessage.schema)
})

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
export const schema = Schema.union(AssignShard_, UnassignShards_, Send_, PingShards_)
