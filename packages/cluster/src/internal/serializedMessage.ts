import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import type * as SerializedMessage from "../SerializedMessage.js"

/** @internal */
const SerializedMessageSymbolKey = "@effect/cluster/SerializedMessage"

/** @internal */
export const SerializedMessageTypeId: SerializedMessage.SerializedMessageTypeId = Symbol.for(
  SerializedMessageSymbolKey
) as SerializedMessage.SerializedMessageTypeId

/** @internal */
export function make(value: string): SerializedMessage.SerializedMessage {
  return Data.struct({ [SerializedMessageTypeId]: SerializedMessageTypeId, value })
}

/** @internal */
export function isSerializedMessage(value: unknown): value is SerializedMessage.SerializedMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    SerializedMessageTypeId in value &&
    value[SerializedMessageTypeId] === SerializedMessageTypeId
  )
}

/** @internal */
export const schema: Schema.Schema<
  SerializedMessage.SerializedMessage,
  { readonly "@effect/cluster/SerializedMessage": "@effect/cluster/SerializedMessage"; readonly value: string }
> = Schema.data(
  Schema.rename(
    Schema.struct({
      [SerializedMessageSymbolKey]: Schema.compose(
        Schema.compose(Schema.literal(SerializedMessageSymbolKey), Schema.symbol, { strict: false }),
        Schema.uniqueSymbolFromSelf(SerializedMessageTypeId),
        { strict: false }
      ),
      value: Schema.string
    }),
    { [SerializedMessageSymbolKey]: SerializedMessageTypeId }
  )
)
