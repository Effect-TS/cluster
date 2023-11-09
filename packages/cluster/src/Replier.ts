/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import { RecipientBehaviourContext } from "./RecipientBehaviour.js"
import * as ReplyId from "./ReplyId.js"

/**
 * @since 1.0.0
 * @category symbols
 */
export const TypeId = "./Replier"

/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface Replier<A> {
  readonly _id: TypeId
  readonly id: ReplyId.ReplyId
  readonly schema: Schema.Schema<unknown, A>
  readonly reply: (
    reply: A
  ) => Effect.Effect<RecipientBehaviourContext, never, void>
}

/**
 * @since 1.0.0
 * @category constructors
 */
export const replier = <I, A>(id: ReplyId.ReplyId, schema: Schema.Schema<I, A>): Replier<A> => {
  const self: Replier<A> = {
    _id: TypeId,
    id,
    schema: schema as any,
    reply: (reply) =>
      Effect.flatMap(
        RecipientBehaviourContext,
        (recipientBehaviourContext) => recipientBehaviourContext.reply(id, reply)
      )
  }
  return self
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isReplier<A>(value: unknown): value is Replier<A> {
  return typeof value === "object" && value !== null && "_id" in value && value._id === TypeId
}

/**
 * @since 1.0.0
 * @category schema
 */
export const schema = <I, A>(schema: Schema.Schema<I, A>): Schema.Schema<I, Replier<A>> => {
  return Schema.transform(
    ReplyId.schema,
    Schema.unknown,
    (id) => replier(id, schema) as any,
    (_) => {
      return (_ as any).id
    }
  ) as any
}
