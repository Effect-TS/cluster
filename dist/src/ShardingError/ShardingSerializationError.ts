/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import * as Schema from "@effect/schema/Schema"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingSerializationErrorTag = "@effect/shardcake/ShardingSerializationError" as const

const ShardingSerializationErrorSchema_ = Schema.data(Schema.struct({
  _tag: Schema.literal(ShardingSerializationErrorTag),
  error: Schema.string
}))

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingSerializationError extends Schema.To<typeof ShardingSerializationErrorSchema_> {}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingSerializationError(error: string): ShardingSerializationError {
  return Data.struct({
    _tag: ShardingSerializationErrorTag,
    error
  })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingSerializationError(value: any): value is ShardingSerializationError {
  return value && "_tag" in value && value._tag === ShardingSerializationErrorTag
}

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingSerializationErrorSchema: Schema.Schema<
  Schema.From<typeof ShardingSerializationErrorSchema_>,
  ShardingSerializationError
> = ShardingSerializationErrorSchema_
