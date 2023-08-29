/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import * as Schema from "@effect/schema/Schema"

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorSendTimeoutTag = "@effect/sharding/ShardingErrorSendTimeout" as const

const ShardingErrorSendTimeoutSchema_ = Schema.data(
  Schema.struct({
    _tag: Schema.literal(ShardingErrorSendTimeoutTag)
  })
)

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingErrorSendTimeout extends Schema.To<typeof ShardingErrorSendTimeoutSchema_> {}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingErrorSendTimeout(): ShardingErrorSendTimeout {
  return Data.struct({ _tag: ShardingErrorSendTimeoutTag })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingErrorSendTimeout(value: any): value is ShardingErrorSendTimeout {
  return value && "_tag" in value && value._tag === ShardingErrorSendTimeoutTag
}

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorSendTimeoutSchema: Schema.Schema<
  Schema.From<typeof ShardingErrorSendTimeoutSchema_>,
  ShardingErrorSendTimeout
> = ShardingErrorSendTimeoutSchema_
