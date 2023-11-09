/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "./ShardId"

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardId extends Schema.Schema.To<typeof schema> {}

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
