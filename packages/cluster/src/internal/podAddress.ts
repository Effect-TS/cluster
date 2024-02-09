import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import type * as PodAddress from "../PodAddress.js"

/** @internal */
const PodAddressSymbolKey = "@effect/cluster/PodAddress"

/** @internal */
export const PodAddressTypeId: PodAddress.PodAddressTypeId = Symbol.for(
  PodAddressSymbolKey
) as PodAddress.PodAddressTypeId

/** @internal */
export function make(host: string, port: number): PodAddress.PodAddress {
  return Data.struct({ [PodAddressTypeId]: PodAddressTypeId, host, port })
}

/** @internal */
export function isPodAddress(value: unknown): value is PodAddress.PodAddress {
  return (
    typeof value === "object" &&
    value !== null &&
    PodAddressTypeId in value &&
    value[PodAddressTypeId] === PodAddressTypeId
  )
}

/** @internal */
export function show(podAddress: PodAddress.PodAddress) {
  return `http://${podAddress.host}:${podAddress.port}`
}

/** @internal */
export const schema: Schema.Schema<
  PodAddress.PodAddress,
  { readonly "@effect/cluster/PodAddress": "@effect/cluster/PodAddress"; readonly host: string; readonly port: number }
> = Schema.data(
  Schema.rename(
    Schema.struct({
      [PodAddressSymbolKey]: Schema.compose(
        Schema.compose(Schema.literal(PodAddressSymbolKey), Schema.symbol, { strict: false }),
        Schema.uniqueSymbol(PodAddressTypeId),
        { strict: false }
      ),
      host: Schema.string,
      port: Schema.number
    }),
    { [PodAddressSymbolKey]: PodAddressTypeId }
  )
)
