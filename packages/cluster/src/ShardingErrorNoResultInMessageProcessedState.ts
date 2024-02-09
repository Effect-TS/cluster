/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingErrorNoResultInProcessedMessageStateTag = "./ShardingErrorNoResultInProcessedMessageState" as const

const ShardingErrorNoResultInProcessedMessageStateSchema_ = Schema.data(Schema.struct({
  _tag: Schema.literal(ShardingErrorNoResultInProcessedMessageStateTag)
}))

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingErrorNoResultInProcessedMessageState
  extends Schema.Schema.To<typeof ShardingErrorNoResultInProcessedMessageStateSchema_>
{}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingErrorNoResultInProcessedMessageState(): ShardingErrorNoResultInProcessedMessageState {
  return Data.struct({
    _tag: ShardingErrorNoResultInProcessedMessageStateTag
  })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingErrorNoResultInProcessedMessageState(
  value: unknown
): value is ShardingErrorNoResultInProcessedMessageState {
  return typeof value === "object" && value !== null && "_tag" in value &&
    value._tag === ShardingErrorNoResultInProcessedMessageStateTag
}

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorNoResultInProcessedMessageStateSchema: Schema.Schema<
  ShardingErrorNoResultInProcessedMessageState,
  Schema.Schema.From<typeof ShardingErrorNoResultInProcessedMessageStateSchema_>
> = ShardingErrorNoResultInProcessedMessageStateSchema_
