/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingErrorSerializationTag = "./ShardingErrorSerialization" as const

const ShardingErrorSerializationSchema_ = Schema.data(Schema.struct({
  _tag: Schema.literal(ShardingErrorSerializationTag),
  error: Schema.string
}))

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingErrorSerialization extends Schema.Schema.To<typeof ShardingErrorSerializationSchema_> {}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingErrorSerialization(error: string): ShardingErrorSerialization {
  return Data.struct({
    _tag: ShardingErrorSerializationTag,
    error
  })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingErrorSerialization(value: any): value is ShardingErrorSerialization {
  return value && "_tag" in value && value._tag === ShardingErrorSerializationTag
}

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorSerializationSchema: Schema.Schema<
  Schema.Schema.From<typeof ShardingErrorSerializationSchema_>,
  ShardingErrorSerialization
> = ShardingErrorSerializationSchema_
