import * as Data from "@effect/data/Data";
/**
 * @since 1.0.0
 * @category symbols
 */
export const PodAddressTypeId: unique symbol = Symbol.for("@effect/shardcake/PodAddress");

/**
 * @since 1.0.0
 * @category symbols
 */
export type PodAddressTypeId = typeof PodAddressTypeId;

export interface PodAddress {
  readonly [PodAddressTypeId]: {};
  host: string;
  port: number;
}

export function podAddress(host: string, port: number): PodAddress {
  return Data.struct({ [PodAddressTypeId]: {}, host, port });
}
