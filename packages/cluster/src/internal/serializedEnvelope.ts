import * as Schema from "@effect/schema/Schema"
import * as Serializable from "@effect/schema/Serializable"
import { pipe } from "effect/Function"
import * as PrimaryKey from "effect/PrimaryKey"
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
  messageId: string,
  body: SerializedMessage.SerializedMessage
): SerializedEnvelope.SerializedEnvelope {
  return new SerializedEnvelope_({
    [SerializedEnvelopeTypeId]: SerializedEnvelopeTypeId,
    messageId,
    entityType,
    entityId,
    body
  })
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

const SerializedEnvelopeTypeIdSchema = pipe(
  Schema.compose(
    Schema.compose(Schema.Literal(SerializedEnvelopeSymbolKey), Schema.Symbol, { strict: false }),
    Schema.UniqueSymbolFromSelf(SerializedEnvelopeTypeId),
    { strict: false }
  )
)

/** @internal */
export class SerializedEnvelope_ extends Schema.Class<SerializedEnvelope_>(SerializedEnvelopeSymbolKey)({
  [SerializedEnvelopeTypeId]: Schema.propertySignature(SerializedEnvelopeTypeIdSchema).pipe(
    Schema.fromKey(SerializedEnvelopeSymbolKey)
  ),
  entityType: Schema.String,
  entityId: Schema.String,
  messageId: Schema.String,
  body: SerializedMessage.schema
}) {
  get [Serializable.symbol]() {
    return this.constructor
  }
  get [Serializable.symbolResult]() {
    return { Success: Schema.Void, Failure: Schema.Never }
  }
  get [PrimaryKey.symbol]() {
    return this.messageId + "@" + this.entityType + "#" + this.entityId
  }
}

export const schema: Schema.Schema<
  SerializedEnvelope.SerializedEnvelope,
  SerializedEnvelope.SerializedEnvelope.Encoded,
  never
> = Schema.asSchema(SerializedEnvelope_)
