import * as Data from "@fp-ts/data/Data";

/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardIdTypeId: unique symbol = Symbol.for("@effect/shardcake/ShardId");

/**
 * @since 1.0.0
 * @category symbols
 */
export type ShardIdTypeId = typeof ShardIdTypeId;

export interface ShardId {
  [ShardIdTypeId]: {};
  value: number;
}

export function apply(value: number): ShardId {
  return Data.struct({ [ShardIdTypeId]: {}, value });
}
