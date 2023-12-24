/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingErrorWhileOfferingMessageTag = "./ShardingErrorWhileOfferingMessage" as const

const ShardingErrorWhileOfferingMessageSchema_ = Schema.data(Schema.struct({
  _tag: Schema.literal(ShardingErrorWhileOfferingMessageTag),
  error: Schema.string
}))

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingErrorWhileOfferingMessage
  extends Schema.Schema.To<typeof ShardingErrorWhileOfferingMessageSchema_>
{}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingErrorWhileOfferingMessage(error: string): ShardingErrorWhileOfferingMessage {
  return Data.struct({
    _tag: ShardingErrorWhileOfferingMessageTag,
    error
  })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingErrorWhileOfferingMessage(value: unknown): value is ShardingErrorWhileOfferingMessage {
  return typeof value === "object" && value !== null && "_tag" in value &&
    value._tag === ShardingErrorWhileOfferingMessageTag
}

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorWhileOfferingMessageSchema: Schema.Schema<
  Schema.Schema.From<typeof ShardingErrorWhileOfferingMessageSchema_>,
  ShardingErrorWhileOfferingMessage
> = ShardingErrorWhileOfferingMessageSchema_
