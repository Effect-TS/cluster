import type * as Effect from "effect/Effect"
import type * as ReplyId from "./MessageId.js"
import type * as SerializedMessage from "./SerializedMessage.js"

export interface ReplyStorage {
  readonly saveReply: (
    entityTypeName: string,
    entityId: string,
    replyId: ReplyId.ReplyId,
    reply: SerializedMessage.SerializedMessage
  ) => Effect.Effect<never, never, void>
  readonly pullReply: (
    entityTypeName: string,
    entityId: string,
    replyId: ReplyId.ReplyId
  ) => Effect.Effect<never, never, SerializedMessage.SerializedMessage>
}
