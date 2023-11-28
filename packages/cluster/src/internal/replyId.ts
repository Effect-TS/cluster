import * as Schema from "@effect/schema/Schema"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import type * as ReplyId from "../ReplyId.js"

/** @internal */
const ReplyIdSymbolKey = "@effect/cluster/ReplyId"

/** @internal */
export const ReplyIdTypeId: ReplyId.ReplyIdTypeId = Symbol.for(ReplyIdSymbolKey) as ReplyId.ReplyIdTypeId

/** @internal */
export function isReplyId(value: unknown): value is ReplyId.ReplyId {
  return (
    typeof value === "object" &&
    value !== null &&
    ReplyIdTypeId in value &&
    value[ReplyIdTypeId] === ReplyIdTypeId
  )
}

/** @internal */
export function make(value: string): ReplyId.ReplyId {
  return Data.struct({ [ReplyIdTypeId]: ReplyIdTypeId, value })
}

/** @internal */
const makeUUID = typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function" ?
  Effect.sync(() =>
    // @ts-expect-error
    ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(
      /[018]/g,
      (c: any) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    )
  ) :
  Effect.sync(() => (Math.random() * 10000).toString(36))

/** @internal */
export const makeEffect = pipe(
  makeUUID,
  Effect.map(make)
)

/** @internal */
export const schema: Schema.Schema<
  { readonly value: string; readonly "@effect/cluster/ReplyId": "@effect/cluster/ReplyId" },
  ReplyId.ReplyId
> = Schema.data(
  Schema.rename(
    Schema.struct({
      [ReplyIdSymbolKey]: Schema.compose(
        Schema.symbolFromString(Schema.literal(ReplyIdSymbolKey)),
        Schema.uniqueSymbol(ReplyIdTypeId)
      ),
      value: Schema.string
    }),
    { [ReplyIdSymbolKey]: ReplyIdTypeId }
  )
)
