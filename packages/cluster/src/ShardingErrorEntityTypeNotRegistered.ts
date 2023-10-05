/**
 * @since 1.0.0
 */
import * as PodAddress from "@effect/cluster/PodAddress"
import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingErrorEntityTypeNotRegisteredTag = "@effect/cluster/ShardingErrorEntityTypeNotRegistered" as const

const ShardingErrorEntityTypeNotRegisteredSchema_ = Schema.data(
  Schema.struct({
    _tag: Schema.literal(ShardingErrorEntityTypeNotRegisteredTag),
    entityType: Schema.string,
    podAddress: PodAddress.schema
  })
)

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingErrorEntityTypeNotRegistered
  extends Schema.Schema.To<typeof ShardingErrorEntityTypeNotRegisteredSchema_>
{}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingErrorEntityTypeNotRegistered(
  entityType: string,
  podAddress: PodAddress.PodAddress
): ShardingErrorEntityTypeNotRegistered {
  return Data.struct({ _tag: ShardingErrorEntityTypeNotRegisteredTag, entityType, podAddress })
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function isShardingErrorEntityTypeNotRegistered(value: unknown): value is ShardingErrorEntityTypeNotRegistered {
  return typeof value === "object" && value !== null && "_tag" in value &&
    value["_tag"] === ShardingErrorEntityTypeNotRegisteredTag
}

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorEntityTypeNotRegisteredSchema: Schema.Schema<
  Schema.Schema.From<typeof ShardingErrorEntityTypeNotRegisteredSchema_>,
  ShardingErrorEntityTypeNotRegistered
> = ShardingErrorEntityTypeNotRegisteredSchema_
