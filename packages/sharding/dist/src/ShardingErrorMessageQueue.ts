/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingErrorMessageQueueTag = "@effect/sharding/ShardingErrorMessageQueue" as const

const ShardingErrorMessageQueueSchema_ = Schema.data(Schema.struct({
  _tag: Schema.literal(ShardingErrorMessageQueueTag),
  error: Schema.string
}))

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingErrorMessageQueue extends Schema.Schema.To<typeof ShardingErrorMessageQueueSchema_> {}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingErrorMessageQueue(error: string): ShardingErrorMessageQueue {
  return Data.struct({
    _tag: ShardingErrorMessageQueueTag,
    error
  })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingErrorMessageQueue(value: unknown): value is ShardingErrorMessageQueue {
  return typeof value === "object" && value !== null && "_tag" in value &&
    value._tag === ShardingErrorMessageQueueTag
}

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorMessageQueueSchema: Schema.Schema<
  Schema.Schema.From<typeof ShardingErrorMessageQueueSchema_>,
  ShardingErrorMessageQueue
> = ShardingErrorMessageQueueSchema_
