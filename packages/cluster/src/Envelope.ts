/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as Serializable from "@effect/schema/Serializable"
import * as Serializable from "@effect/schema/Serializable"
import * as Data from "effect/Data"
import * as PrimaryKey from "effect/PrimaryKey"
import * as Request from "effect/Request"
import { TypeIdSchema } from "./internal/utils.js"
import type * as Message from "./Message.js"
import type * as SerializedMessage from "./SerializedMessage.js"

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
 * A SerializedEnvelope is the message that goes over the wire between pods.
 * Inside the Envelope, you have the encoded messages, plus some informations on where it should be routed to.
 *
 * @since 1.0.0
 * @category models
 */
export interface Envelope<M extends Message.Message.Any> extends
  Message.Message<
    Message.Message.Success<M>,
    Message.Message.SuccessEncoded<M>,
    Message.Message.Error<M>,
    Message.Message.ErrorEncoded<M>
  >
{
  [SerializedEnvelopeTypeId]: SerializedEnvelopeTypeId
  entityType: string
  entityId: string
  messageId: string
  body: M
}

/**
 * Construct a new `Envelope`
 *
 * @since 1.0.0
 * @category constructors
 */
export function make<M extends Message.Message.Any>(
  entityType: string,
  entityId: string,
  messageId: string,
  body: M
): Envelope<M> {
  return new Envelope({
    [SerializedEnvelopeTypeId]: SerializedEnvelopeTypeId,
    messageId,
    entityType,
    entityId,
    body
  })
}

/**
 * Ensures that the given value is a SerializedEnvelope.
 *
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
export function schema<A extends Message.Message.Any, AI>(fa: Schema.Schema<A, AI>){
  return class Base extends Schema.Class<Base>()
}
