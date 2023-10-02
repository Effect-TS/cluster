/**
 * @since 1.0.0
 */
import * as Data from "effect/Data"
import * as Schema from "@effect/schema/Schema"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingErrorEntityNotManagedByThisPodTag =
  "@effect/sharding/ShardingErrorEntityNotManagedByThisPod" as const

const ShardingErrorEntityNotManagedByThisPodSchema_ = Schema.data(
  Schema.struct({
    _tag: Schema.literal(ShardingErrorEntityNotManagedByThisPodTag),
    entityId: Schema.string
  })
)

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingErrorEntityNotManagedByThisPod
  extends Schema.Schema.To<typeof ShardingErrorEntityNotManagedByThisPodSchema_>
{}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingErrorEntityNotManagedByThisPod(entityId: string): ShardingErrorEntityNotManagedByThisPod {
  return Data.struct({ _tag: ShardingErrorEntityNotManagedByThisPodTag, entityId })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingErrorEntityNotManagedByThisPod(value: any): value is ShardingErrorEntityNotManagedByThisPod {
  return value && "_tag" in value && value._tag === ShardingErrorEntityNotManagedByThisPodTag
}

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingErrorEntityNotManagedByThisPodSchema: Schema.Schema<
  Schema.Schema.From<typeof ShardingErrorEntityNotManagedByThisPodSchema_>,
  ShardingErrorEntityNotManagedByThisPod
> = ShardingErrorEntityNotManagedByThisPodSchema_
