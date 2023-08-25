/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import * as Schema from "@effect/schema/Schema"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingEncodeErrorTag = "@effect/shardcake/ShardingEncodeError" as const

const ShardingEncodeErrorSchema_ = Schema.data(Schema.struct({
  _tag: Schema.literal(ShardingEncodeErrorTag),
  error: Schema.string
}))

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingEncodeError extends Schema.To<typeof ShardingEncodeErrorSchema_> {}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingEncodeError(error: string): ShardingEncodeError {
  return Data.struct({
    _tag: ShardingEncodeErrorTag,
    error
  })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingEncodeError(value: any): value is ShardingEncodeError {
  return value && "_tag" in value && value._tag === ShardingEncodeErrorTag
}

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingEncodeErrorSchema: Schema.Schema<
  Schema.From<typeof ShardingEncodeErrorSchema_>,
  ShardingEncodeError
> = ShardingEncodeErrorSchema_
