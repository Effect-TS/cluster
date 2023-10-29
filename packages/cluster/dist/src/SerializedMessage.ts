/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import { pipe } from "effect/Function"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "@effect/cluster/SerializedMessage"

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface SerializedMessage extends Schema.Schema.To<typeof schema> {}

/**
 * Construct a new `SerializedMessage` from its internal string value.
 *
 * @since 1.0.0
 * @category constructors
 */
export function make(value: string): SerializedMessage {
  return Data.struct({ _id: TypeId, value })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isSerializedMessage(value: unknown): value is SerializedMessage {
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
export const schemaFromString: Schema.Schema<string, SerializedMessage> = Schema.transform(
  Schema.string,
  schema,
  make,
  (_) => _.value
)
