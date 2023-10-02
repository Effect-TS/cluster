/**
 * A module that provides utilities to build basic behaviours
 * @since 1.0.0
 */
import type * as Duration from "effect/Duration";
import type * as Option from "effect/Option";
import type * as Effect from "effect/Effect";
import type * as Queue from "effect/Queue";
import type * as Message from "@effect/sharding/Message";
import type { MessageQueueConstructor } from "@effect/sharding/MessageQueue";
import type * as PoisonPill from "@effect/sharding/PoisonPill";
import type * as StreamMessage from "@effect/sharding/StreamMessage";
import type * as Stream from "effect/Stream";
/**
 * The args received by the RecipientBehaviour
 * @since 1.0.0
 * @category models
 */
export interface RecipientContext<Req> {
    readonly entityId: string;
    readonly dequeue: Queue.Dequeue<Req | PoisonPill.PoisonPill>;
    readonly reply: <A extends Req & Message.Message<any>>(message: A, reply: Message.Success<A>) => Effect.Effect<never, never, void>;
    readonly replyStream: <A extends Req & StreamMessage.StreamMessage<any>>(message: A, reply: Stream.Stream<never, never, StreamMessage.Success<A>>) => Effect.Effect<never, never, void>;
}
/**
 * An alias to a RecipientBehaviour
 * @since 1.0.0
 * @category models
 */
export interface RecipientBehaviour<R, Req> {
    (args: RecipientContext<Req>): Effect.Effect<R, never, void>;
}
/**
 * An utility that process a message at a time, or interrupts on PoisonPill
 * @since 1.0.0
 * @category utils
 */
export type EntityBehaviourOptions<Req> = {
    messageQueueConstructor?: MessageQueueConstructor<Req>;
    entityMaxIdleTime?: Option.Option<Duration.Duration>;
};
//# sourceMappingURL=RecipientBehaviour.d.ts.map
