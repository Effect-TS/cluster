import * as Parser from "@effect/schema/Parser"
import * as Schema from "@effect/schema/Schema"
import * as Serializable from "@effect/schema/Serializable"
import { PrimaryKey, Schedule } from "effect"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import type * as Message from "../Message.js"
import type { ReplyId } from "../MessageId.js"
import * as RecipientBehaviourContext from "../RecipientBehaviourContext.js"

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

    // TODO

    return { ...result, make } as any
  }
}
