/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"

/** @internal */
const PodAddressSymbolKey = "@effect/cluster/PodAddress"

/**
 * @since 1.0.0
 * @category symbols
 */
export const PodAddressTypeId: unique symbol = Symbol.for(PodAddressSymbolKey)

/** @internal */
export const PodAddressTypeIdSchema = Schema.compose(
  Schema.compose(Schema.Literal(PodAddressSymbolKey), Schema.Symbol, { strict: false }),
  Schema.UniqueSymbolFromSelf(PodAddressTypeId),
  { strict: false }
)

/**
 * @since 1.0.0
 * @category symbols
 */
export type PodAddressTypeId = typeof PodAddressTypeId

/**
 * @since 1.0.0
 * @category models
 */
export class PodAddress extends Schema.Class<PodAddress>(PodAddressSymbolKey)({
  [PodAddressTypeId]: Schema.propertySignature(PodAddressTypeIdSchema).pipe(Schema.fromKey(PodAddressSymbolKey)),
  host: Schema.String,
  port: Schema.Number
}) {
  /**
   * @since 1.0.0
   */
  toString() {
    return `PodAddress(${this.host}:${this.port})`
  }
}

/**
 * @since 1.0.0
 * @category models
 */
export namespace PodAddress {
  /**
   * @since 1.0.0
   * @category models
   */
  export interface Encoded extends Schema.Schema.Encoded<typeof PodAddress> {}
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function make(host: string, port: number): PodAddress {
  return new PodAddress({ [PodAddressTypeId]: PodAddressTypeId, host, port })
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isPodAddress(value: unknown): value is PodAddress {
  return (
    typeof value === "object" &&
    value !== null &&
    PodAddressTypeId in value &&
    value[PodAddressTypeId] === PodAddressTypeId
  )
}

/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema: Schema.Schema<
  PodAddress,
  PodAddress.Encoded
> = Schema.asSchema(PodAddress)
