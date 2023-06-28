import * as Data from "@effect/data/Data"
import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import * as Schema from "@effect/schema/Schema"
import * as crypto from "crypto"

export const ReplyIdTypeId = "@effect/shardcake/ReplyId"

export function isReplyId(value: unknown): value is ReplyId {
  return (
    typeof value === "object" &&
    value !== null &&
    "_tag" in value &&
    value["_tag"] === ReplyIdTypeId
  )
}

export const schema = Schema.data(
  Schema.struct({
    _tag: Schema.literal(ReplyIdTypeId),
    value: Schema.string
  })
)

export interface ReplyId extends Schema.To<typeof schema> {}

export function replyId(value: string): ReplyId {
  return Data.struct({ _tag: ReplyIdTypeId, value })
}

const makeUUID = typeof crypto !== undefined && typeof crypto.getRandomValues === "function" ?
  Effect.sync(() =>
    // @ts-expect-error
    ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(
      /[018]/g,
      (c: any) => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    )
  ) :
  Effect.sync(() => (Math.random() * 10000).toString(36))

export const make = pipe(
  makeUUID,
  Effect.map(replyId)
)
