/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import * as Schema from "@effect/schema/Schema"
import * as crypto from "crypto"

/**
 * @since 1.0.0
 * @category symbol
 */
export const TypeId = "@effect/shardcake/ReplyId"

/**
 * @since 1.0.0
 * @category symbol
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface ReplyId extends Schema.To<typeof schema> {}

/** @internal */
export function isReplyId(value: unknown): value is ReplyId {
  return (
    typeof value === "object" &&
    value !== null &&
    "_id" in value &&
    value["_id"] === TypeId
  )
}

/**
 * Construct a new `ReplyId` from its internal id string value.
 *
 * @since 1.0.0
 * @category constructors
 */
export function make(value: string): ReplyId {
  return Data.struct({ _id: TypeId, value })
}

/** @internal */
const makeUUID = typeof crypto !== undefined && typeof crypto.getRandomValues === "function" ?
  Effect.sync(() =>
    // @ts-expect-error
    ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(
      /[018]/g,
      (c: any) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    )
  ) :
  Effect.sync(() => (Math.random() * 10000).toString(36))

/**
 * Construct a new `ReplyId` by internally building a UUID.
 *
 * @since 1.0.0
 * @category constructors
 */
export const makeEffect = pipe(
  makeUUID,
  Effect.map(make)
)

/**
 * This is the schema for a value.
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
