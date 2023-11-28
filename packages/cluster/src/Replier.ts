/**
 * @since 1.0.0
 */
import type * as Schema from "@effect/schema/Schema"
import type * as Effect from "effect/Effect"
import * as internal from "./internal/replier.js"
import type { RecipientBehaviourContext } from "./RecipientBehaviourContext.js"
import type * as ReplyId from "./ReplyId.js"

/**
 * @since 1.0.0
 * @category symbols
 */
export const ReplierTypeId: unique symbol = internal.ReplierTypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export type ReplierTypeId = typeof ReplierTypeId

/**
 * @since 1.0.0
 * @category models
 */
export interface Replier<A> {
  readonly [ReplierTypeId]: ReplierTypeId
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
export const make: <I, A>(id: ReplyId.ReplyId, schema: Schema.Schema<I, A>) => Replier<A> = internal.make

/**
 * @since 1.0.0
 * @category utils
 */
export const isReplier: <A>(value: unknown) => value is Replier<A> = internal.isReplier

/**
 * @since 1.0.0
 * @category schema
 */
export const schema: <I, A>(schema: Schema.Schema<I, A>) => Schema.Schema<I, Replier<A>> = internal.schema
