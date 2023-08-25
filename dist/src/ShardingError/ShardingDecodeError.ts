/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import * as Schema from "@effect/schema/Schema"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingDecodeErrorTag = "@effect/shardcake/ShardingDecodeError" as const

const ShardingDecodeErrorSchema_ = Schema.data(Schema.struct({
  _tag: Schema.literal(ShardingDecodeErrorTag),
  error: Schema.string
}))

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingDecodeError extends Schema.To<typeof ShardingDecodeErrorSchema_> {}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingDecodeError(error: string): ShardingDecodeError {
  return Data.struct({
    _tag: ShardingDecodeErrorTag,
    error
  })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingDecodeError(value: any): value is ShardingDecodeError {
  return value && "_tag" in value && value._tag === ShardingDecodeErrorTag
}

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingDecodeErrorSchema: Schema.Schema<
  Schema.From<typeof ShardingDecodeErrorSchema_>,
  ShardingDecodeError
> = ShardingDecodeErrorSchema_
