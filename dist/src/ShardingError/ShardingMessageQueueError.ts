/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import * as Schema from "@effect/schema/Schema"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingMessageQueueErrorTag = "@effect/shardcake/ShardingMessageQueueError" as const

const ShardingMessageQueueErrorSchema_ = Schema.data(Schema.struct({
  _tag: Schema.literal(ShardingMessageQueueErrorTag),
  error: Schema.string
}))

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingMessageQueueError extends Schema.To<typeof ShardingMessageQueueErrorSchema_> {}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingMessageQueueError(error: string): ShardingMessageQueueError {
  return Data.struct({
    _tag: ShardingMessageQueueErrorTag,
    error
  })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingMessageQueueError(value: unknown): value is ShardingMessageQueueError {
  return typeof value === "object" && value !== null && "_tag" in value &&
    value._tag === ShardingMessageQueueErrorTag
}

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingMessageQueueErrorSchema: Schema.Schema<
  Schema.From<typeof ShardingMessageQueueErrorSchema_>,
  ShardingMessageQueueError
> = ShardingMessageQueueErrorSchema_
