/**
 * @since 1.0.0
 */
import type * as Either from "@effect/data/Either";
import type * as HashMap from "@effect/data/HashMap";
import type * as Effect from "@effect/io/Effect";
import type * as Message from "@effect/shardcake/Message";
import type * as PodAddress from "@effect/shardcake/PodAddress";
import type * as ReplyId from "@effect/shardcake/ReplyId";
import type * as ShardError from "@effect/shardcake/ShardError";
/**
 * An interface to communicate with a remote broadcast receiver
 * @since 1.0.0
 * @category models
 */
export interface Broadcaster<Msg> {
    /**
     * Broadcast a message without waiting for a response (fire and forget)
     * @since 1.0.0
     */
    broadcastDiscard(topic: string): (msg: Msg) => Effect.Effect<never, ShardError.Throwable, void>;
    /**
     * Broadcast a message and wait for a response from each consumer
     * @since 1.0.0
     */
    broadcast(topic: string): <A extends Msg & Message.Message<any>>(msg: (replyId: ReplyId.ReplyId) => A) => Effect.Effect<never, ShardError.Throwable, HashMap.HashMap<PodAddress.PodAddress, Either.Either<ShardError.Throwable, Message.Success<A>>>>;
}
//# sourceMappingURL=Broadcaster.d.ts.map