/**
 * @since 1.0.0
 */
import * as MessageState from "@effect/cluster/MessageState"
import * as SerializedEnvelope from "@effect/cluster/SerializedEnvelope"
import * as SerializedMessage from "@effect/cluster/SerializedMessage"
import * as ShardId from "@effect/cluster/ShardId"
import * as ShardingError from "@effect/cluster/ShardingError"
import * as Schema from "@effect/schema/Schema"

/**
 * @since 1.0.0
 * @category schema
 */
export const AssignShard_: Schema.Schema<
  {
    readonly shards: ReadonlyArray<
      { readonly "@effect/cluster/ShardId": "@effect/cluster/ShardId"; readonly value: number }
    >
  },
  { readonly shards: ReadonlyArray<ShardId.ShardId> }
> = Schema.struct({
  shards: Schema.array(ShardId.schema)
})

/**
 * @since 1.0.0
 * @category schema
 */
export const UnassignShards_: Schema.Schema<
  {
    readonly shards: ReadonlyArray<
      { readonly "@effect/cluster/ShardId": "@effect/cluster/ShardId"; readonly value: number }
    >
  },
  { readonly shards: ReadonlyArray<ShardId.ShardId> }
> = Schema.struct({
  shards: Schema.array(ShardId.schema)
})

/**
 * @since 1.0.0
 * @category schema
 */
export const Send_: Schema.Schema<
  {
    readonly message: {
      readonly "@effect/cluster/SerializedEnvelope": "@effect/cluster/SerializedEnvelope"
      readonly entityId: string
      readonly entityType: string
      readonly body: {
        readonly "@effect/cluster/SerializedMessage": "@effect/cluster/SerializedMessage"
        readonly value: string
      }
    }
  },
  { readonly message: SerializedEnvelope.SerializedEnvelope }
> = Schema.struct({
  message: SerializedEnvelope.schema
})

/**
 * @since 1.0.0
 * @category schema
 */
export const SendResult_ = Schema.either(
  ShardingError.schema,
  MessageState.schema(SerializedMessage.schema)
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
export const schema = Schema.union(AssignShard_, UnassignShards_, Send_, PingShards_)
