/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as Serializable from "@effect/schema/Serializable"
import * as PrimaryKey from "effect/PrimaryKey"
import { TypeIdSchema } from "./internal/utils.js"
import * as SerializedMessage from "./SerializedMessage.js"

/** @internal */
const SerializedEnvelopeSymbolKey = "@effect/cluster/SerializedEnvelope"

/**
 * @since 1.0.0
 * @category symbols
 */
export const SerializedEnvelopeTypeId: unique symbol = Symbol.for(SerializedEnvelopeSymbolKey)

/** @internal */
const SerializedEnvelopeTypeIdSchema = TypeIdSchema(SerializedEnvelopeSymbolKey, SerializedEnvelopeTypeId)

/**
 * @since 1.0.0
 * @category symbols
 */
export type SerializedEnvelopeTypeId = typeof SerializedEnvelopeTypeId

/**
 * @since 1.0.0
 * @category models
 */
export class SerializedEnvelope extends Schema.Class<SerializedEnvelope>(SerializedEnvelopeSymbolKey)({
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

/**
 * @since 1.0.0
 * @category models
 */
export namespace SerializedEnvelope {
  /**
   * @since 1.0.0
   * @category models
   */
  export interface Encoded extends Schema.Schema.Encoded<typeof SerializedEnvelope> {}
}

/**
 * Construct a new `SerializedEnvelope`
 *
 * @since 1.0.0
 * @category constructors
 */
export function make(
  entityType: string,
  entityId: string,
  messageId: string,
  body: SerializedMessage.SerializedMessage
): SerializedEnvelope {
  return new SerializedEnvelope({
    [SerializedEnvelopeTypeId]: SerializedEnvelopeTypeId,
    messageId,
    entityType,
    entityId,
    body
  })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isSerializedEnvelope(value: unknown): value is SerializedEnvelope {
  return (
    typeof value === "object" &&
    value !== null &&
    SerializedEnvelopeTypeId in value &&
    value[SerializedEnvelopeTypeId] === SerializedEnvelopeTypeId
  )
}

/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema: Schema.Schema<SerializedEnvelope, SerializedEnvelope.Encoded, never> = Schema.asSchema(
  SerializedEnvelope
)
