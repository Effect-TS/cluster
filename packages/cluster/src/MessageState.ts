/**
 * @since 1.0.0
 */
import type * as Schema from "@effect/schema/Schema"
import type * as Effect from "effect/Effect"
import type * as Option from "effect/Option"
import * as internal from "./internal/messageState.js"

/**
 * @since 1.0.0
 * @category symbols
 */
export const MessageStateTypeId: unique symbol = internal.MessageStateTypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export type MessageStateTypeId = typeof MessageStateTypeId

/**
 * A message state given to just acknowledged messages
 *
 * @since 1.0.0
 * @category models
 */
export interface MessageStateAcknowledged {
  readonly [MessageStateTypeId]: MessageStateTypeId
  readonly _tag: "@effect/cluster/MessageState/Acknowledged"
}

/**
 * A message state given to processed messages
 *
 * @since 1.0.0
 * @category models
 */
export interface MessageStateProcessed<A> {
  readonly [MessageStateTypeId]: MessageStateTypeId
  readonly _tag: "@effect/cluster/MessageState/Processed"
  readonly result: Option.Option<A>
}

/**
 * @since 1.0.0
 * @category models
 */
export type MessageState<A> = MessageStateAcknowledged | MessageStateProcessed<A>

/**
 * @since 1.0.0
 * @category models
 */
export namespace MessageState {
  /**
   * @since 1.0.0
   * @category models
   */
  export type From<I> = {
    readonly "@effect/cluster/MessageState": "@effect/cluster/MessageState"
    readonly _tag: "@effect/cluster/MessageState/Acknowledged"
  } | {
    readonly result: Schema.OptionFrom<I>
    readonly "@effect/cluster/MessageState": "@effect/cluster/MessageState"
    readonly _tag: "@effect/cluster/MessageState/Processed"
  }
}

/**
 * @since 1.0.0
 * @category utils
 */
export const isMessageState = internal.isMessageState

/**
 * @since 1.0.0
 * @category utils
 */
export const match = internal.match

/**
 * @since 1.0.0
 * @category constructors
 */
export const Acknowledged: MessageStateAcknowledged = internal.Acknowledged

/**
 * @since 1.0.0
 * @category constructors
 */
export const Processed: <A>(result: Option.Option<A>) => MessageStateProcessed<A> = internal.Processed

/**
 * @since 1.0.0
 * @category utils
 */
export const mapEffect: <A, B, R, E>(
  value: MessageState<A>,
  fn: (value: A) => Effect.Effect<R, E, B>
) => Effect.Effect<R, E, MessageState<B>> = internal.mapEffect

/**
 * @since 1.0.0
 * @category schema
 */
export const schema: <I, A>(
  result: Schema.Schema<I, A>
) => Schema.Schema<
  MessageState.From<I>,
  MessageState<A>
> = internal.schema
