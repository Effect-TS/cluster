/**
 * @since 1.0.0
 */
import * as Data from "effect/Data"
import * as Schema from "@effect/schema/Schema"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/sharding/ShardId"

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardId extends Schema.To<typeof schema> {}

/**
 * @since 1.0.0
 * @category constructors
 */
export function make(value: number): ShardId {
  return Data.struct({ _id: TypeId, value })
}

/** @internal */
export function show(value: ShardId) {
  return "ShardId(" + value.value + ")"
}

/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema = Schema.data(Schema.struct({
  _id: Schema.literal(TypeId),
  value: Schema.number
}))
