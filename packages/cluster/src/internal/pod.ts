/** @internal */
import type * as Pod from "@effect/cluster/Pod"
import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
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
export const schema: Schema.Schema<{
  readonly "@effect/cluster/Pod": "@effect/cluster/Pod"
  readonly address: {
    readonly "@effect/cluster/PodAddress": "@effect/cluster/PodAddress"
    readonly host: string
    readonly port: number
  }
  readonly version: string
}, Pod.Pod> = Schema.data(Schema.rename(
  Schema.struct({
    [PodSymbolKey]: Schema.compose(
      Schema.symbolFromString(Schema.literal(PodSymbolKey)),
      Schema.uniqueSymbol(PodTypeId)
    ),
    address: PodAddress.schema,
    version: Schema.string
  }),
  { [PodSymbolKey]: PodTypeId }
))
