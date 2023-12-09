/**
 * @since 1.0.0
 */
import * as Schema from "@effect/schema/Schema"

/**
 * A message state given to just acknowledged messages
 *
 * @since 1.0.0
 * @category models
 */
export interface MessageStateAcknowledged {
  readonly _tag: "@effect/cluster/MessageState/Acknowledged"
}

/**
 * A message state given to processed messages
 *
 * @since 1.0.0
 * @category models
 */
export interface MessageStateDone<A> {
  readonly _tag: "@effect/cluster/MessageState/Done"
  readonly response: A
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isMessageStateDone<A>(value: MessageState<A>): value is MessageStateDone<A> {
  return value._tag === "@effect/cluster/MessageState/Done"
}

/**
 * @since 1.0.0
 * @category utils
 */
export function isMessageStateAcknowledged<A>(value: MessageState<A>): value is MessageStateDone<A> {
  return value._tag === "@effect/cluster/MessageState/Acknowledged"
}

/**
 * @since 1.0.0
 * @category models
 */
export type MessageState<A> = MessageStateAcknowledged | MessageStateDone<A>

/**
 * @since 1.0.0
 * @category constructors
 */
export const MessageStateAcknowledged: MessageStateAcknowledged = { _tag: "@effect/cluster/MessageState/Acknowledged" }

/**
 * @since 1.0.0
 * @category constructors
 */
export const MessageStateDone = <A>(response: A): MessageStateDone<A> => ({
  _tag: "@effect/cluster/MessageState/Done",
  response
})

/**
 * @since 1.0.0
 * @category schema
 */
export function schema<RI, RA>(responseSchema: Schema.Schema<RI, RA>) {
  return Schema.union(
    Schema.struct({
      _tag: Schema.literal("@effect/cluster/MessageState/Acknowledged")
    }),
    Schema.struct({
      _tag: Schema.literal("@effect/cluster/MessageState/Done"),
      response: responseSchema
    })
  )
}
