import * as Data from "@effect/data/Data"
import * as Schema from "@effect/schema/Schema"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ShardIdTypeId = "@effect/shardcake/ShardId"

/**
 * @since 1.0.0
 * @category symbols
 */
export type ShardIdTypeId = typeof ShardIdTypeId

export const schema = Schema.struct({
  _tag: Schema.literal(ShardIdTypeId),
  value: Schema.number
})

export interface ShardId extends Schema.To<typeof schema> {}

export function shardId(value: number): ShardId {
  return Data.struct({ _tag: ShardIdTypeId, value })
}
