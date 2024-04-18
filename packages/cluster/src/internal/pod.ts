import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import type * as Pod from "../Pod.js"
import * as PodAddress from "../PodAddress.js"

/** @internal */
const PodSymbolKey = "@effect/cluster/Pod"

/** @internal */
export const PodTypeId: Pod.PodTypeId = Symbol.for(PodSymbolKey) as Pod.PodTypeId

/** @internal */
export function make(address: PodAddress.PodAddress, version: string): Pod.Pod {
  return Data.struct({ [PodTypeId]: PodTypeId, address, version })
}

/** @internal */
export function isPod(value: unknown): value is Pod.Pod {
  return (
    typeof value === "object" &&
    value !== null &&
    PodTypeId in value &&
    value[PodTypeId] === PodTypeId
  )
}

/** @internal */
export const schema: Schema.Schema<
  {
    readonly address: PodAddress.PodAddress
    readonly version: string
    readonly [Pod.PodTypeId]: typeof Pod.PodTypeId
  },
  {
    readonly address: PodAddress.PodAddress.From
    readonly version: string
    readonly "@effect/cluster/Pod": "@effect/cluster/Pod"
  }
> = Schema.Data(Schema.rename(
  Schema.Struct({
    [PodSymbolKey]: Schema.compose(
      Schema.compose(Schema.Literal(PodSymbolKey), Schema.Symbol, { strict: false }),
      Schema.UniqueSymbolFromSelf(PodTypeId),
      { strict: false }
    ),
    address: PodAddress.schema,
    version: Schema.String
  }),
  { [PodSymbolKey]: PodTypeId }
))
