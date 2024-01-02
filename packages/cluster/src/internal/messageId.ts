import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import type * as MessageId from "../MessageId.js"

/** @internal */
const MessageIdSymbolKey = "@effect/cluster/MessageId"

/** @internal */
export const MessageIdTypeId: MessageId.MessageIdTypeId = Symbol.for(MessageIdSymbolKey) as MessageId.MessageIdTypeId

/** @internal */
export function isMessageId(value: unknown): value is MessageId.MessageId {
  return (
    typeof value === "object" &&
    value !== null &&
    MessageIdTypeId in value &&
    value[MessageIdTypeId] === MessageIdTypeId
  )
}

/** @internal */
export function make(value: string): MessageId.MessageId {
  return Data.struct({ [MessageIdTypeId]: MessageIdTypeId, value })
}

/** @internal */
const makeUUID = typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function" ?
  Effect.sync(() =>
    // @ts-expect-error
    ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(
      /[018]/g,
      (c: any) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    )
  ) :
  Effect.sync(() => (Math.random() * 10000).toString(36))

/** @internal */
export const makeEffect = pipe(
  makeUUID,
  Effect.map(make)
)

/** @internal */
export const schema: Schema.Schema<
  { readonly value: string; readonly "@effect/cluster/MessageId": "@effect/cluster/MessageId" },
  Data.Data<{ readonly value: string; readonly [MessageId.MessageIdTypeId]: typeof MessageId.MessageIdTypeId }>
> = Schema.data(
  Schema.rename(
    Schema.struct({
      [MessageIdSymbolKey]: Schema.compose(
        Schema.compose(Schema.literal(MessageIdSymbolKey), Schema.symbol),
        Schema.uniqueSymbol(MessageIdTypeId)
      ),
      value: Schema.string
    }),
    { [MessageIdSymbolKey]: MessageIdTypeId }
  )
)
