/** @internal */
import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import type * as Message from "../Message.js"
import * as Replier from "../Replier.js"
import * as ReplyId from "../ReplyId.js"

/** @internal */
export function isMessage<R>(value: unknown): value is Message.Message<R> {
  return (
    typeof value === "object" &&
    value !== null &&
    "replier" in value &&
    Replier.isReplier(value.replier)
  )
}

/** @internal */
export function schema<RI, RA>(replySchema: Schema.Schema<RI, RA>) {
  return function<I extends object, A extends object>(
    item: Schema.Schema<I, A>
  ): Message.MessageSchema<I, A, RA> {
    const result = pipe(item, Schema.extend(Schema.struct({ replier: Replier.schema(replySchema) })))

    const make = (arg: A, replyId: ReplyId.ReplyId): A & Message.Message<RA> =>
      Data.struct({ ...arg, replier: Replier.replier(replyId, replySchema) }) as any

    const makeEffect = (arg: A): Effect.Effect<never, never, A & Message.Message<RA>> =>
      pipe(
        ReplyId.makeEffect,
        Effect.map((replyId) => make(arg, replyId))
      )

    return { ...result, make, makeEffect } as any
  }
}
