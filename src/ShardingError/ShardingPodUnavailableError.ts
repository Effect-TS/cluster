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
export const ShardingPodUnavailableErrorTag = "@effect/sharding/ShardingPodUnavailableError" as const

const ShardingPodUnavailableErrorSchema_ = Schema.data(Schema.struct({
  _tag: Schema.literal(ShardingPodUnavailableErrorTag),
  pod: PodAddress.schema
}))

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingPodUnavailableError extends Schema.To<typeof ShardingPodUnavailableErrorSchema_> {}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingPodUnavailableError(pod: PodAddress.PodAddress): ShardingPodUnavailableError {
  return Data.struct({ _tag: ShardingPodUnavailableErrorTag, pod })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingPodUnavailableError(value: any): value is ShardingPodUnavailableError {
  return value && value !== null && "_tag" in value && value._tag === ShardingPodUnavailableErrorTag
}

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingPodUnavailableErrorSchema: Schema.Schema<
  Schema.From<typeof ShardingPodUnavailableErrorSchema_>,
  ShardingPodUnavailableError
> = ShardingPodUnavailableErrorSchema_
