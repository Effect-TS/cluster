/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import * as Schema from "@effect/schema/Schema"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/shardcake/PoisonPill"

/**
 * @since 1.0.0
 * @category models
 */
export interface PoisonPill extends Schema.To<typeof schema> {}

/**
 * `PoisonPill`
 *
 * @since 1.0.0
 * @category constructors
 */
export const make: PoisonPill = Data.struct({ _id: TypeId })

/**
 * @since 1.0.0
 * @category utils
 */
export function isPoisonPill(value: unknown): value is PoisonPill {
  return (
    typeof value === "object" &&
    value !== null &&
    "_id" in value &&
    value["_id"] === TypeId
  )
}

/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema = Schema.data(
  Schema.struct({
    _id: Schema.literal(TypeId)
  })
)
