/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import * as Schema from "@effect/schema/Schema"

/**
 * @since 1.0.0
 * @category symbol
 */
export const TypeId = "@effect/shardcake/ByteArray"

/**
 * @since 1.0.0
 * @category models
 */
export interface ByteArray extends Schema.To<typeof schema> {}

/**
 * Construct a new `ByteArray` from its internal string value.
 *
 * @since 1.0.0
 * @category constructors
 */
export function make(value: string): ByteArray {
  return Data.struct({ _id: TypeId, value })
}

/** @internal */
export function isByteArray(value: unknown): value is ByteArray {
  return (
    typeof value === "object" &&
    value !== null &&
    "_id" in value &&
    value["_id"] === TypeId
  )
}

/**
 * This is the schema for a ByteArray value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema = Schema.data(
  Schema.struct({
    _id: Schema.literal(TypeId),
    value: Schema.string
  })
)
