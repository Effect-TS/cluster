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
export const ShardingErrorPodUnavailableTag = "@effect/cluster/ShardingErrorPodUnavailable" as const

const ShardingErrorPodUnavailableSchema_ = Schema.data(Schema.struct({
  _tag: Schema.literal(ShardingErrorPodUnavailableTag),
  pod: PodAddress.schema
}))

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingErrorPodUnavailable extends Schema.Schema.To<typeof ShardingErrorPodUnavailableSchema_> {}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingErrorPodUnavailable(pod: PodAddress.PodAddress): ShardingErrorPodUnavailable {
  return Data.struct({ _tag: ShardingErrorPodUnavailableTag, pod })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingErrorPodUnavailable(value: any): value is ShardingErrorPodUnavailable {
  return value && value !== null && "_tag" in value && value._tag === ShardingErrorPodUnavailableTag
}

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorPodUnavailableSchema: Schema.Schema<
  Schema.Schema.From<typeof ShardingErrorPodUnavailableSchema_>,
  ShardingErrorPodUnavailable
> = ShardingErrorPodUnavailableSchema_
