import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import type * as ShardId from "../ShardId.js"

/** @internal */
const ShardIdSymbolKey = "@effect/cluster/ShardId"

/** @internal */
export const ShardIdTypeId: ShardId.ShardIdTypeId = Symbol.for(ShardIdSymbolKey) as ShardId.ShardIdTypeId

/** @internal */
export function make(value: number): ShardId.ShardId {
  return Data.struct({ [ShardIdTypeId]: ShardIdTypeId, value })
}

/** @internal */
export function show(value: ShardId.ShardId) {
  return "ShardId(" + value.value + ")"
}

/** @internal */
export const schema: Schema.Schema<
  ShardId.ShardId,
  { readonly "@effect/cluster/ShardId": "@effect/cluster/ShardId"; readonly value: number }
> = Schema.data(
  Schema.rename(
    Schema.struct({
      [ShardIdSymbolKey]: Schema.compose(
        Schema.compose(Schema.literal(ShardIdSymbolKey), Schema.symbol, { strict: false }),
        Schema.uniqueSymbolFromSelf(ShardIdTypeId),
        { strict: false }
      ),
      value: Schema.number
    }),
    { [ShardIdSymbolKey]: ShardIdTypeId }
  )
)
