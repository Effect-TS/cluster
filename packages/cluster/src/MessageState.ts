import * as Schema from "@effect/schema/Schema"

export interface MessageStateAcknowledged {
  readonly _tag: "@effect/cluster/MessageState/Acknowledged"
}

export interface MessageStateDone<A> {
  readonly _tag: "@effect/cluster/MessageState/Done"
  readonly response: A
}

export function isMessageStateDone<A>(value: MessageState<A>): value is MessageStateDone<A> {
  return value._tag === "@effect/cluster/MessageState/Done"
}
export function isMessageStateAcknowledged<A>(value: MessageState<A>): value is MessageStateDone<A> {
  return value._tag === "@effect/cluster/MessageState/Acknowledged"
}

export type MessageState<A> = MessageStateAcknowledged | MessageStateDone<A>

export const MessageStateAcknowledged: MessageStateAcknowledged = { _tag: "@effect/cluster/MessageState/Acknowledged" }

export const MessageStateDone = <A>(response: A): MessageStateDone<A> => ({
  _tag: "@effect/cluster/MessageState/Done",
  response
})

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
