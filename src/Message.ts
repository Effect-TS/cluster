/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import { pipe } from "@effect/data/Function"
import * as Schema from "@effect/schema/Schema"
import type { JsonData } from "@effect/shardcake/JsonData"
import * as Replier from "@effect/shardcake/Replier"
import type * as ReplyId from "@effect/shardcake/ReplyId"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId: unique symbol = Symbol.for("@effect/shardcake/Message")

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * A `Message<A>` is a request from a data source for a value of type `A`
 *
 * @since 1.0.0
 * @category models
 */
export interface Message<A> {
  readonly replier: Replier.Replier<A>
}

/**
 * Extracts the success type from a `Message<A>`.
 *
 * @since 1.0.0
 * @category utils
 */
export type Success<A> = A extends Message<infer X> ? X : never

/**
 * @since 1.0.0
 * @category utils
 */
export function isMessage<R>(value: unknown): value is Message<R> {
  return (
    typeof value === "object" &&
    value !== null &&
    "replier" in value &&
    Replier.isReplier(value.replier)
  )
}

/**
 * Creates both the schema and a constructor for a `Message<A>`
 *
 * @since 1.0.0
 * @category schema
 */
export function schema<RI extends JsonData, RA>(replySchema: Schema.Schema<RI, RA>) {
  return function<I extends JsonData, A extends object>(
    item: Schema.Schema<I, A>
  ): readonly [
    Schema.Schema<I, Schema.Spread<A & Message<RA>>>,
    (arg: A) => (replyId: ReplyId.ReplyId) => Schema.Spread<A & Message<RA>>
  ] {
    const result = pipe(item, Schema.extend(Schema.struct({ replier: Replier.schema(replySchema) })))

    const make = (arg: A) =>
      (replyId: ReplyId.ReplyId): Schema.Spread<A & Message<RA>> =>
        Data.struct({ ...arg, replier: Replier.replier(replyId, replySchema) }) as any

    return [result as any, make] as const
  }
}
