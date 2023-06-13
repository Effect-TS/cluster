import * as Option from "@effect/data/Option";
import * as PodAddress from "./PodAddress";
import * as Schema from "@effect/schema/Schema";
import * as Data from "@effect/data/Data";

/**
 * @since 1.0.0
 * @category symbols
 */
export const PodTypeId = "@effect/shardcake/Pod";

/**
 * @since 1.0.0
 * @category symbols
 */
export type PodTypeId = typeof PodTypeId;

export const Schema_ = Schema.data(
  Schema.struct({
    _tag: Schema.literal(PodTypeId),
    address: PodAddress.schema,
    version: Schema.string,
  })
);

export interface Pod extends Schema.To<typeof Schema_> {}

export function pod(address: PodAddress.PodAddress, version: string): Pod {
  return Data.struct({ _tag: PodTypeId, address, version });
}
