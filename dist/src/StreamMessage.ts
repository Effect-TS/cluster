/**
 * @since 1.0.0
 */
import * as Data from "@effect/data/Data"
import { pipe } from "@effect/data/Function"
import * as Schema from "@effect/schema/Schema"
import type * as ReplyId from "@effect/shardcake/ReplyId"
import * as StreamReplier from "@effect/shardcake/StreamReplier"
import type { JsonData } from "@effect/shardcake/utils"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId: unique symbol = Symbol.for("@effect/shardcake/StreamMessage")

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
export interface StreamMessage<A> {
  readonly replier: StreamReplier.StreamReplier<A>
}

/**
 * Extracts the success type from a `Message<A>`.
 *
 * @since 1.0.0
 * @category utils
 */
export type Success<A> = A extends StreamMessage<infer X> ? X : never

/** @internal */
export function isStreamMessage<R>(value: unknown): value is StreamMessage<R> {
  return (
    typeof value === "object" &&
    value !== null &&
    "replier" in value &&
    (StreamReplier.isStreamReplier(value.replier))
  )
}

/**
 * Creates both the schema and a constructor for a `Message<A>`
 *
 * @since 1.0.0
 * @category schema
 */
export function schema<I2 extends JsonData, A>(success: Schema.Schema<I2, A>) {
  return function<I1 extends JsonData, I extends object>(
    item: Schema.Schema<I1, I>
  ): readonly [
    Schema.Schema<I1, Schema.Spread<I & StreamMessage<A>>>,
    (arg: I) => (replyId: ReplyId.ReplyId) => Schema.Spread<I & StreamMessage<A>>
  ] {
    const result = pipe(item, Schema.extend(Schema.struct({ replier: StreamReplier.schema(success) })))

    const make = (arg: I) =>
      (replyId: ReplyId.ReplyId): Schema.Spread<I & StreamMessage<A>> =>
        Data.struct({ ...arg, replier: StreamReplier.streamReplier(replyId, success) }) as any

    return [result as any, make] as const
  }
}
