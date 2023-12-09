import * as Parser from "@effect/schema/Parser"
import * as Schema from "@effect/schema/Schema"
import * as Serializable from "@effect/schema/Serializable"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import type * as Message from "../Message.js"
import * as RecipientBehaviourContext from "../RecipientBehaviourContext.js"
import type { ReplyId } from "../ReplyId.js"

/** @internal */
export function isMessage<R>(value: unknown): value is Message.Message<R> {
  return (
    typeof value === "object" &&
    value !== null &&
    Serializable.symbolResult in value
  )
}

/** @internal */
export function successSchema<A>(message: Message.Message<A>): Schema.Schema<unknown, A> {
  return Serializable.successSchema(message)
}

/** @internal */
export function schema<RI, RA>(replySchema: Schema.Schema<RI, RA>) {
  return function<I extends object, A extends object>(
    item: Schema.Schema<I, A>
  ): Message.MessageSchema<I, A, RA> {
    const symbolResultSchema = { Failure: Schema.never, Success: replySchema }

    function reply(replyId: ReplyId, value: RA) {
      return pipe(
        RecipientBehaviourContext.RecipientBehaviourContext,
        Effect.flatMap((context) => context.reply(replyId, replySchema, value))
      )
    }

    const result = Schema.transform(
      item,
      Schema.any,
      (_, __) =>
        Data.struct({
          ...Parser.parse(item)(_, __),
          [Serializable.symbolResult]: symbolResultSchema,
          reply
        }),
      (_, __) => _
    )

    const make = (arg: A): A & Message.Message<RA> =>
      Data.struct({ ...arg, [Serializable.symbolResult]: { Failure: Schema.never, Success: replySchema } }) as any

    return { ...result, make } as any
  }
}
