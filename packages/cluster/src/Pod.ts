/**
 * @since 1.0.0
 */
import type * as Schema from "@effect/schema/Schema"
import * as internal from "./internal/pod.js"
import type * as PodAddress from "./PodAddress.js"

/**
 * @since 1.0.0
 * @category symbols
 */
export const PodTypeId: unique symbol = internal.PodTypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export type PodTypeId = typeof PodTypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface Pod {
  readonly [PodTypeId]: PodTypeId
  readonly address: PodAddress.PodAddress
  readonly version: string
}

/**
 * @since 1.0.0
 * @category models
 */
export namespace Pod {
  /**
   * @since 1.0.0
   * @category models
   */
  export interface From {
    readonly address: PodAddress.PodAddress.From
    readonly version: string
    readonly "@effect/cluster/Pod": "@effect/cluster/Pod"
  }
}

/**
 * @since 1.0.0
 * @category utils
 */
export const isPod: (value: unknown) => value is Pod = internal.isPod

/**
 * @since 1.0.0
 * @category constructors
 */
export const make: (address: PodAddress.PodAddress, version: string) => Pod = internal.make

/**
 * @since 1.0.0
 * @category schema
 */
export const schema: Schema.Schema<
  Pod,
  Pod.From
> = internal.schema
