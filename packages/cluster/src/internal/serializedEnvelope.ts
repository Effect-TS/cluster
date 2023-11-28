import * as Schema from "@effect/schema/Schema"
import type { Option } from "effect"
import * as Data from "effect/Data"
import * as ReplyId from "../ReplyId.js"
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
  body: SerializedMessage.SerializedMessage,
  replyId: Option.Option<ReplyId.ReplyId>
): SerializedEnvelope.SerializedEnvelope {
  return Data.struct({ [SerializedEnvelopeTypeId]: SerializedEnvelopeTypeId, entityType, entityId, body, replyId })
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
    readonly entityId: string
    readonly entityType: string
    readonly body: {
      readonly "@effect/cluster/SerializedMessage": "@effect/cluster/SerializedMessage"
      readonly value: string
    }
    readonly replyId: { readonly _tag: "None" } | {
      readonly _tag: "Some"
      readonly value: { readonly "@effect/cluster/ReplyId": "@effect/cluster/ReplyId"; readonly value: string }
    }
    readonly "@effect/cluster/SerializedEnvelope": "@effect/cluster/SerializedEnvelope"
  },
  SerializedEnvelope.SerializedEnvelope
> = Schema.data(
  Schema.rename(
    Schema.struct({
      [SerializedEnvelopeSymbolKey]: Schema.compose(
        Schema.symbolFromString(Schema.literal(SerializedEnvelopeSymbolKey)),
        Schema.uniqueSymbol(SerializedEnvelopeTypeId)
      ),
      entityId: Schema.string,
      entityType: Schema.string,
      body: SerializedMessage.schema,
      replyId: Schema.option(ReplyId.schema)
    }),
    { [SerializedEnvelopeSymbolKey]: SerializedEnvelopeTypeId }
  )
)
