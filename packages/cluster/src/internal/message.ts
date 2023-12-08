import * as Parser from "@effect/schema/Parser"
import * as Schema from "@effect/schema/Schema"
import * as Serializable from "@effect/schema/Serializable"
import * as Data from "effect/Data"
import type * as Message from "../Message.js"

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
    const result = Schema.transform(
      item,
      Schema.any,
      (_, __) =>
        Data.struct({
          ...Parser.parse(item)(_, __),
          [Serializable.symbolResult]: { Failure: Schema.never, Success: replySchema }
        }),
      (_, __) => _
    )

    const make = (arg: A): A & Message.Message<RA> =>
      Data.struct({ ...arg, [Serializable.symbolResult]: { Failure: Schema.never, Success: replySchema } }) as any

    return { ...result, make } as any
  }
}
