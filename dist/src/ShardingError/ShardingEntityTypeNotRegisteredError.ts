/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import * as Schema from "@effect/schema/Schema"
import * as PodAddress from "@effect/shardcake/PodAddress"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingEntityTypeNotRegisteredErrorTag = "@effect/shardcake/ShardingEntityTypeNotRegisteredError" as const

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingEntityTypeNotRegisteredErrorSchema = Schema.data(
  Schema.struct({
    _tag: Schema.literal(ShardingEntityTypeNotRegisteredErrorTag),
    entityType: Schema.string,
    podAddress: PodAddress.schema
  })
)

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingEntityTypeNotRegisteredError
  extends Schema.To<typeof ShardingEntityTypeNotRegisteredErrorSchema>
{}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingEntityTypeNotRegisteredError(
  entityType: string,
  podAddress: PodAddress.PodAddress
): ShardingEntityTypeNotRegisteredError {
  return Data.struct({ _tag: ShardingEntityTypeNotRegisteredErrorTag, entityType, podAddress })
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function isShardingEntityTypeNotRegisteredError(value: unknown): value is ShardingEntityTypeNotRegisteredError {
  return typeof value === "object" && value !== null && "_tag" in value &&
    value["_tag"] === ShardingEntityTypeNotRegisteredErrorTag
}
