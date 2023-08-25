/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import * as Schema from "@effect/schema/Schema"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardingEntityNotManagedByThisPodErrorTag =
  "@effect/shardcake/ShardingEntityNotManagedByThisPodError" as const

/**
 * @since 1.0.0
 * @category schema
 */
export const ShardingEntityNotManagedByThisPodErrorSchema = Schema.data(
  Schema.struct({
    _tag: Schema.literal(ShardingEntityNotManagedByThisPodErrorTag),
    entityId: Schema.string
  })
)

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardingEntityNotManagedByThisPodError
  extends Schema.To<typeof ShardingEntityNotManagedByThisPodErrorSchema>
{}

/**
 * @since 1.0.0
 * @category constructors
 */
export function ShardingEntityNotManagedByThisPodError(entityId: string): ShardingEntityNotManagedByThisPodError {
  return Data.struct({ _tag: ShardingEntityNotManagedByThisPodErrorTag, entityId })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isShardingEntityNotManagedByThisPodError(value: any): value is ShardingEntityNotManagedByThisPodError {
  return value && "_tag" in value && value._tag === ShardingEntityNotManagedByThisPodErrorTag
}
