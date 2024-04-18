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
> = Schema.Data(
  Schema.rename(
    Schema.Struct({
      [ShardIdSymbolKey]: Schema.compose(
        Schema.compose(Schema.Literal(ShardIdSymbolKey), Schema.Symbol, { strict: false }),
        Schema.UniqueSymbolFromSelf(ShardIdTypeId),
        { strict: false }
      ),
      value: Schema.Number
    }),
    { [ShardIdSymbolKey]: ShardIdTypeId }
  )
)
