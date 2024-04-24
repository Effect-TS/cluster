/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as PodAddress from "./PodAddress.js"

/** @internal */
const PodSymbolKey = "@effect/cluster/Pod"

/**
 * @since 1.0.0
 * @category symbols
 */
export const PodTypeId: unique symbol = Symbol.for(PodSymbolKey)

/**
 * @since 1.0.0
 * @category symbols
 */
export type PodTypeId = typeof PodTypeId

/** @internal */
const PodTypeIdSchema = Schema.compose(
  Schema.compose(Schema.Literal(PodSymbolKey), Schema.Symbol, { strict: false }),
  Schema.UniqueSymbolFromSelf(PodTypeId),
  { strict: false }
)

/**
 * @since 1.0.0
 * @category models
 */
export class Pod extends Schema.Class<Pod>(PodSymbolKey)({
  [PodTypeId]: Schema.propertySignature(PodTypeIdSchema).pipe(Schema.fromKey(PodSymbolKey)),
  address: PodAddress.schema,
  version: Schema.String
}) {}

/**
 * @since 1.0.0
 * @category models
 */
export namespace Pod {
  /**
   * @since 1.0.0
   * @category models
   */
  export interface Encoded extends Schema.Schema.Encoded<typeof Pod> {}
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isPod(value: unknown): value is Pod {
  return (
    typeof value === "object" &&
    value !== null &&
    PodTypeId in value &&
    value[PodTypeId] === PodTypeId
  )
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function make(address: PodAddress.PodAddress, version: string): Pod {
  return new Pod({ [PodTypeId]: PodTypeId, address, version })
}

/**
 * @since 1.0.0
 * @category schema
 */
export const schema: Schema.Schema<
  Pod,
  Pod.Encoded
> = Schema.asSchema(Pod)
