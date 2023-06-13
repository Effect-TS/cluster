import * as Effect from "@effect/io/Effect";
import { Replier } from "./Replier";
import { Throwable } from "./ShardError";
import * as Message from "./Message";
import * as Schema from "@effect/schema/Schema";
import * as ReplyId from "./ReplyId";

/**
 * An interface to communicate with a remote entity
 * @tparam Msg the type of message that can be sent to this entity type
 */
export interface Messenger<Msg> {
  /**
   * Send a message without waiting for a response (fire and forget)
   */
  sendDiscard(entityId: string): (msg: Msg) => Effect.Effect<never, Throwable, void>;

  /**
   * Send a message and wait for a response of type `Res`
   */
  send(
    entityId: string
  ): <A extends Msg & Message.Message<any>>(
    msg: (replyId: ReplyId.ReplyId) => A
  ) => Effect.Effect<never, Throwable, Message.Success<A>>;
}
