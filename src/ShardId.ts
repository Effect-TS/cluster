import * as Data from "@effect/data/Data";
import * as Schema from "@effect/schema/Schema";

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

export const Schema_ = Schema.struct({
  _tag: Schema.uniqueSymbol(ShardIdTypeId),
  value: Schema.number,
});

export interface ShardId extends Schema.To<typeof Schema_> {}

export function shardId(value: number): ShardId {
  return Data.struct({ _tag: ShardIdTypeId, value });
}
