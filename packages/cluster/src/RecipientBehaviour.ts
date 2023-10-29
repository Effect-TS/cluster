/**
 * A module that provides utilities to build basic behaviours
 * @since 1.0.0
 */
import type { MessageQueueConstructor } from "@effect/cluster/MessageQueue"
import type * as PoisonPill from "@effect/cluster/PoisonPill"
import type * as ReplyId from "@effect/cluster/ReplyId"
import { Tag } from "effect/Context"
import type * as Duration from "effect/Duration"
import type * as Effect from "effect/Effect"
import type * as Option from "effect/Option"
import type * as Queue from "effect/Queue"

/**
 * The context where a RecipientBehaviour is running, knows the current entityId, entityType, etc...
 * @since 1.0.0
 * @category models
 */
export interface RecipientBehaviourContext {
  readonly entityId: string
  readonly reply: (replyId: ReplyId.ReplyId, reply: unknown) => Effect.Effect<never, never, void>
}

/**
 * A tag to access current RecipientBehaviour
 * @since 1.0.0
 * @category context
 */
export const RecipientBehaviourContext = Tag<RecipientBehaviourContext>()

/**
 * An alias to a RecipientBehaviour
 * @since 1.0.0
 * @category models
 */
export interface RecipientBehaviour<R, Req> {
  (
    args: {
      readonly entityId: string
      readonly dequeue: Queue.Dequeue<Req | PoisonPill.PoisonPill>
    }
  ): Effect.Effect<R | RecipientBehaviourContext, never, void>
}

/**
 * An utility that process a message at a time, or interrupts on PoisonPill
 * @since 1.0.0
 * @category utils
 */
export type EntityBehaviourOptions<Req> = {
  messageQueueConstructor?: MessageQueueConstructor<Req>
  entityMaxIdleTime?: Option.Option<Duration.Duration>
}
