import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";

/**
 * @since 1.0.0
 * @category symbols
 */
export const PodAddressTypeId = "@effect/shardcake/PodAddress";

/**
 * @since 1.0.0
 * @category symbols
 */
export type PodAddressTypeId = typeof PodAddressTypeId;

export const Schema_ = Schema.data(
  Schema.struct({
    _tag: Schema.literal(PodAddressTypeId),
    host: Schema.string,
    port: Schema.number,
  })
);

export interface PodAddress extends Schema.To<typeof Schema_> {}

export function podAddress(host: string, port: number): PodAddress {
  return Data.struct({ _tag: PodAddressTypeId, host, port });
}
