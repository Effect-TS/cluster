/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import * as Schema from "@effect/schema/Schema"

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingSendErrorTag = "@effect/shardcake/ShardingSendError" as const

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingSendErrorSchema = Schema.data(
  Schema.struct({
    _tag: Schema.literal(ShardingSendErrorTag),
    error: Schema.string
  })
)

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingSendError extends Schema.To<typeof ShardingSendErrorSchema> {}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingSendError(error: string): ShardingSendError {
  return Data.struct({ _tag: ShardingSendErrorTag, error })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingSendError(value: any): value is ShardingSendError {
  return value && "_tag" in value && value._tag === ShardingSendErrorTag
}
