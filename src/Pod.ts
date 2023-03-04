import * as Option from "@effect/data/Option";
import { PodAddress } from "./PodAddress";

/**
 * @since 1.0.0
 * @category symbols
 */
export const PodTypeId: unique symbol = Symbol.for("@effect/shardcake/Pod");

/**
 * @since 1.0.0
 * @category symbols
 */
export type PodTypeId = typeof PodTypeId;

export interface Pod {
  readonly [PodTypeId]: {};
  address: PodAddress;
  version: string;
}

export function pod(address: PodAddress, version: string): Pod {
  return { [PodTypeId]: {}, address, version };
}
