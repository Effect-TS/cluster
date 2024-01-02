/**
 * @since 1.0.0
 */
import type * as Schema from "@effect/schema/Schema"
import type * as Data from "effect/Data"
import * as internal from "./internal/podAddress.js"

/**
 * @since 1.0.0
 * @category symbols
 */
export const PodAddressTypeId: unique symbol = internal.PodAddressTypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export type PodAddressTypeId = typeof PodAddressTypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface PodAddress extends
  Data.Data<{
    readonly [PodAddressTypeId]: PodAddressTypeId
    readonly host: string
    readonly port: number
  }>
{}

/**
 * @since 1.0.0
 * @category models
 */
export namespace PodAddress {
  /**
   * @since 1.0.0
   * @category models
   */
  export interface From {
    readonly "@effect/cluster/PodAddress": "@effect/cluster/PodAddress"
    readonly host: string
    readonly port: number
  }
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const make: (host: string, port: number) => PodAddress = internal.make

/**
 * @since 1.0.0
 * @category utils
 */
export const isPodAddress: (value: unknown) => value is PodAddress = internal.isPodAddress

/** @internal */
export const show: (podAddress: PodAddress) => string = internal.show

/**
 * This is the schema for a value.
 *
 * @since 1.0.0
 * @category schema
 */
export const schema: Schema.Schema<
  PodAddress.From,
  PodAddress
> = internal.schema
