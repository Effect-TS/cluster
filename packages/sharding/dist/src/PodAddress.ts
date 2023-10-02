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
export const TypeId = "@effect/sharding/PodAddress"

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface PodAddress extends Schema.To<typeof schema> {}

/**
 * @since 1.0.0
 * @category utils
 */
export function isPodAddress(value: unknown): value is PodAddress {
  return (
    typeof value === "object" &&
    value !== null &&
    "_id" in value &&
    value["_id"] === TypeId
  )
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function make(host: string, port: number): PodAddress {
  return Data.struct({ _id: TypeId, host, port })
}

/** @internal */
export function show(podAddress: PodAddress) {
  return `http://${podAddress.host}:${podAddress.port}`
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
    host: Schema.string,
    port: Schema.number
  }),
  Schema.data
)
