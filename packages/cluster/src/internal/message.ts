import type * as Schema from "@effect/schema/Schema"
import * as Serializable from "@effect/schema/Serializable"
import type * as Message from "../Message.js"

/** @internal */
export function isMessageWithResult(value: unknown): value is Message.MessageWithResult<unknown, unknown> {
  return (
    typeof value === "object" && value !== null &&
    Serializable.symbolResult in value
  )
}

/** @internal */
export function exitSchema<A extends Message.MessageWithResult.Any>(
  message: A
): Schema.Schema<Message.MessageWithResult.Exit<A>, unknown> {
  return Serializable.exitSchema(message as any) as any
}
