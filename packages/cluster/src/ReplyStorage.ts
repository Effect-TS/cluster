import * as ReplyId from "./ReplyId.js"
import * as SerializedMessage from "./SerializedMessage.js"
import * as Effect from "effect/Effect"

export interface ReplyStorage {
    readonly saveReply: (entityTypeName: string, entityId: string, replyId: ReplyId.ReplyId, reply: SerializedMessage.SerializedMessage) => Effect.Effect<never, never, void>
    readonly pullReply: ()
}
