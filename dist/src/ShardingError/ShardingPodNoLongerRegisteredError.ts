/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import * as Schema from "@effect/schema/Schema"
import * as PodAddress from "@effect/sharding/PodAddress"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingPodNoLongerRegisteredErrorTag = "@effect/sharding/ShardingPodNoLongerRegisteredError" as const

const ShardingPodNoLongerRegisteredErrorSchema_ = Schema.data(
  Schema.struct({
    _tag: Schema.literal(ShardingPodNoLongerRegisteredErrorTag),
    podAddress: PodAddress.schema
  })
)

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingPodNoLongerRegisteredError
  extends Schema.To<typeof ShardingPodNoLongerRegisteredErrorSchema_>
{}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingPodNoLongerRegisteredError(
  podAddress: PodAddress.PodAddress
): ShardingPodNoLongerRegisteredError {
  return Data.struct({ _tag: ShardingPodNoLongerRegisteredErrorTag, podAddress })
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function isShardingPodNoLongerRegisteredError(value: unknown): value is ShardingPodNoLongerRegisteredError {
  return typeof value === "object" && value !== null && "_tag" in value &&
    value["_tag"] === ShardingPodNoLongerRegisteredErrorTag
}

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingPodNoLongerRegisteredErrorSchema: Schema.Schema<
  Schema.From<typeof ShardingPodNoLongerRegisteredErrorSchema_>,
  ShardingPodNoLongerRegisteredError
> = ShardingPodNoLongerRegisteredErrorSchema_
