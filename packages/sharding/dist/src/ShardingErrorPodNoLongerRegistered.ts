/**
 * @since 1.0.0
 */
import * as Data from "effect/Data"
import * as Schema from "@effect/schema/Schema"
import * as PodAddress from "@effect/sharding/PodAddress"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingErrorPodNoLongerRegisteredTag = "@effect/sharding/ShardingErrorPodNoLongerRegistered" as const

const ShardingErrorPodNoLongerRegisteredSchema_ = Schema.data(
  Schema.struct({
    _tag: Schema.literal(ShardingErrorPodNoLongerRegisteredTag),
    podAddress: PodAddress.schema
  })
)

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingErrorPodNoLongerRegistered
  extends Schema.To<typeof ShardingErrorPodNoLongerRegisteredSchema_>
{}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingErrorPodNoLongerRegistered(
  podAddress: PodAddress.PodAddress
): ShardingErrorPodNoLongerRegistered {
  return Data.struct({ _tag: ShardingErrorPodNoLongerRegisteredTag, podAddress })
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function isShardingErrorPodNoLongerRegistered(value: unknown): value is ShardingErrorPodNoLongerRegistered {
  return typeof value === "object" && value !== null && "_tag" in value &&
    value["_tag"] === ShardingErrorPodNoLongerRegisteredTag
}

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorPodNoLongerRegisteredSchema: Schema.Schema<
  Schema.From<typeof ShardingErrorPodNoLongerRegisteredSchema_>,
  ShardingErrorPodNoLongerRegistered
> = ShardingErrorPodNoLongerRegisteredSchema_
