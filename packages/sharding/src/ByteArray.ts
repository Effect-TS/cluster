/**
 * @since 1.0.0
 */
import * as Data from "effect/Data"
import { pipe } from "effect/Function"
import * as Schema from "@effect/schema/Schema"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/sharding/ByteArray"

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface ByteArray extends Schema.Schema.To<typeof schema> {}

/**
 * Construct a new `ByteArray` from its internal string value.
 *
 * @since 1.0.0
 * @category constructors
 */
export function make(value: string): ByteArray {
  return Data.struct({ _id: TypeId, value })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isByteArray(value: unknown): value is ByteArray {
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
export const schema = pipe(
  Schema.struct({
    _id: Schema.literal(TypeId),
    value: Schema.string
  }),
  Schema.data
)

/**
 * This is the schema for a value starting from a string.
 *
 * @since 1.0.0
 * @category schema
 */
export const schemaFromString: Schema.Schema<string, ByteArray> = Schema.transform(
  Schema.string,
  schema,
  make,
  (byteArray) => byteArray.value
)
