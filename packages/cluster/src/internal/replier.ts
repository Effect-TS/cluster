import * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import { RecipientBehaviourContext } from "../RecipientBehaviourContext.js"
import type * as Replier from "../Replier.js"
import * as ReplyId from "../ReplyId.js"

/** @internal  */
const ReplierSymbolKey = "@effect/cluster/Replier"

/** @internal */
export const ReplierTypeId: Replier.ReplierTypeId = Symbol.for(ReplierSymbolKey) as Replier.ReplierTypeId

/** @internal */
export function make<I, A>(id: ReplyId.ReplyId, schema: Schema.Schema<I, A>): Replier.Replier<A> {
  return {
    [ReplierTypeId]: ReplierTypeId,
    id,
    schema: schema as any,
    reply: (reply) =>
      Effect.flatMap(
        RecipientBehaviourContext,
        (recipientBehaviourContext) => recipientBehaviourContext.reply(id, reply)
      )
  }
}

/** @internal */
export function isReplier<A>(value: unknown): value is Replier.Replier<A> {
  return typeof value === "object" && value !== null && ReplierTypeId in value && value[ReplierTypeId] === ReplierTypeId
}

/** @internal */
export const schema = <I, A>(schema: Schema.Schema<I, A>): Schema.Schema<I, Replier.Replier<A>> => {
  return Schema.transform(
    ReplyId.schema,
    Schema.unknown,
    (id) => make(id, schema) as any,
    (_) => {
      return (_ as any).id
    }
  ) as any
}
