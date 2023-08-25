/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import * as Schema from "@effect/schema/Schema"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingReplyErrorTag = "@effect/shardcake/ShardingReplyError" as const

/**
 * @since 1.0.0
 * @category models
 */
export const ShardingReplyErrorSchema = Schema.data(Schema.struct({
  _tag: Schema.literal(ShardingReplyErrorTag),
  error: Schema.string
}))

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingReplyError extends Schema.To<typeof ShardingReplyErrorSchema> {
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingReplyError(error: string): ShardingReplyError {
  return Data.struct({
    _tag: ShardingReplyErrorTag,
    error
  })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingReplyError(value: any): value is ShardingReplyError {
  return value && "_tag" in value && value._tag === ShardingReplyErrorTag
}
