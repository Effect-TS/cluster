import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import type * as SerializedEnvelope from "../SerializedEnvelope.js"
import * as SerializedMessage from "../SerializedMessage.js"

/** @internal */
const SerializedEnvelopeSymbolKey = "@effect/cluster/SerializedEnvelope"

/** @internal */
export const SerializedEnvelopeTypeId: SerializedEnvelope.SerializedEnvelopeTypeId = Symbol.for(
  SerializedEnvelopeSymbolKey
) as SerializedEnvelope.SerializedEnvelopeTypeId

/** @internal */
export function make(
  entityType: string,
  entityId: string,
  body: SerializedMessage.SerializedMessage
): SerializedEnvelope.SerializedEnvelope {
  return Data.struct({ [SerializedEnvelopeTypeId]: SerializedEnvelopeTypeId, entityType, entityId, body })
}

/** @internal */
export function isSerializedEnvelope(value: unknown): value is SerializedEnvelope.SerializedEnvelope {
  return (
    typeof value === "object" &&
    value !== null &&
    SerializedEnvelopeTypeId in value &&
    value[SerializedEnvelopeTypeId] === SerializedEnvelopeTypeId
  )
}

/** @internal */
export const schema: Schema.Schema<
  {
    readonly "@effect/cluster/SerializedEnvelope": "@effect/cluster/SerializedEnvelope"
    readonly entityId: string
    readonly entityType: string
    readonly body: {
      readonly "@effect/cluster/SerializedMessage": "@effect/cluster/SerializedMessage"
      readonly value: string
    }
  },
  SerializedEnvelope.SerializedEnvelope
> = Schema.data(
  Schema.rename(
    Schema.struct({
      [SerializedEnvelopeSymbolKey]: Schema.compose(
        Schema.compose(Schema.literal(SerializedEnvelopeSymbolKey), Schema.symbol),
        Schema.uniqueSymbol(SerializedEnvelopeTypeId)
      ),
      entityId: Schema.string,
      entityType: Schema.string,
      body: SerializedMessage.schema
    }),
    { [SerializedEnvelopeSymbolKey]: SerializedEnvelopeTypeId }
  )
)
