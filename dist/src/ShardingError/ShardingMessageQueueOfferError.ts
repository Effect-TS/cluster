/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import * as Schema from "@effect/schema/Schema"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingMessageQueueOfferErrorTag = "@effect/shardcake/ShardingMessageQueueOfferError" as const

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingMessageQueueOfferErrorSchema = Schema.data(Schema.struct({
  _tag: Schema.literal(ShardingMessageQueueOfferErrorTag),
  error: Schema.string
}))

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingMessageQueueOfferError extends Schema.To<typeof ShardingMessageQueueOfferErrorSchema> {}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingMessageQueueOfferError(error: string): ShardingMessageQueueOfferError {
  return Data.struct({
    _tag: ShardingMessageQueueOfferErrorTag,
    error
  })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingMessageQueueOfferError(value: unknown): value is ShardingMessageQueueOfferError {
  return typeof value === "object" && value !== null && "_tag" in value &&
    value._tag === ShardingMessageQueueOfferErrorTag
}
