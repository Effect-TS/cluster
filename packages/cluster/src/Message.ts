/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import type * as Types from "effect/Types"
import * as Replier from "./Replier.js"
import * as ReplyId from "./ReplyId.js"

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
 * A `MessageSchema<From, To, A>` is an augmented schema that provides utilities to build the Message<A> with a valid replier.
 *
 * @since 1.0.0
 * @category models
 */
export interface MessageSchema<From, To, A> extends Schema.Schema<From, Types.Simplify<To & Message<A>>> {
  make: (message: To, replyId: ReplyId.ReplyId) => Types.Simplify<To & Message<A>>
  makeEffect: (message: To) => Effect.Effect<never, never, Types.Simplify<To & Message<A>>>
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
export function schema<RI, RA>(replySchema: Schema.Schema<RI, RA>) {
  return function<I extends object, A extends object>(
    item: Schema.Schema<I, A>
  ): MessageSchema<I, A, RA> {
    const result = pipe(item, Schema.extend(Schema.struct({ replier: Replier.schema(replySchema) })))

    const make = (arg: A, replyId: ReplyId.ReplyId): A & Message<RA> =>
      Data.struct({ ...arg, replier: Replier.replier(replyId, replySchema) }) as any

    const makeEffect = (arg: A): Effect.Effect<never, never, A & Message<RA>> =>
      pipe(
        ReplyId.makeEffect,
        Effect.map((replyId) => make(arg, replyId))
      )

    return { ...result, make, makeEffect } as any
  }
}
