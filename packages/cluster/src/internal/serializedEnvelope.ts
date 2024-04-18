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
  SerializedEnvelope.SerializedEnvelope,
  {
    readonly "@effect/cluster/SerializedEnvelope": "@effect/cluster/SerializedEnvelope"
    readonly entityId: string
    readonly entityType: string
    readonly body: {
      readonly "@effect/cluster/SerializedMessage": "@effect/cluster/SerializedMessage"
      readonly value: string
    }
  }
> = Schema.Data(
  Schema.rename(
    Schema.Struct({
      [SerializedEnvelopeSymbolKey]: Schema.compose(
        Schema.compose(Schema.Literal(SerializedEnvelopeSymbolKey), Schema.Symbol, { strict: false }),
        Schema.UniqueSymbolFromSelf(SerializedEnvelopeTypeId),
        { strict: false }
      ),
      entityId: Schema.String,
      entityType: Schema.String,
      body: SerializedMessage.schema
    }),
    { [SerializedEnvelopeSymbolKey]: SerializedEnvelopeTypeId }
  )
)
