/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorSendTimeoutTag = "./ShardingErrorSendTimeout" as const

const ShardingErrorSendTimeoutSchema_ = Schema.data(
  Schema.struct({
    _tag: Schema.literal(ShardingErrorSendTimeoutTag)
  })
)

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingErrorSendTimeout extends Schema.Schema.To<typeof ShardingErrorSendTimeoutSchema_> {}

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
  Schema.Schema.From<typeof ShardingErrorSendTimeoutSchema_>,
  ShardingErrorSendTimeout
> = ShardingErrorSendTimeoutSchema_
