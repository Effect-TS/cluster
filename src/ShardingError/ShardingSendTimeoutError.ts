/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import * as Schema from "@effect/schema/Schema"

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingSendTimeoutErrorTag = "@effect/shardcake/ShardingSendTimeoutError" as const

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingSendTimeoutErrorSchema = Schema.data(
  Schema.struct({
    _tag: Schema.literal(ShardingSendTimeoutErrorTag)
  })
)

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingSendTimeoutError extends Schema.To<typeof ShardingSendTimeoutErrorSchema> {}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingSendTimeoutError(): ShardingSendTimeoutError {
  return Data.struct({ _tag: ShardingSendTimeoutErrorTag })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingSendTimeoutError(value: any): value is ShardingSendTimeoutError {
  return value && "_tag" in value && value._tag === ShardingSendTimeoutErrorTag
}
