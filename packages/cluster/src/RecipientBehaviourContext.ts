/**
 * @since 1.0.0
 * This module provides the context that is given to a RecipientBehaviour
 */
import type * as Message from "@effect/cluster/Message"
import type * as Context from "effect/Context"
import type * as Effect from "effect/Effect"
import * as internal from "./internal/recipientBehaviourContext.js"
import type * as RecipientType from "./RecipientType.js"
import type * as ShardId from "./ShardId.js"

/**
 * @since 1.0.0
 * @category symbols
 */
export const RecipientBehaviourContextTypeId: unique symbol = internal.RecipientBehaviourContextTypeId

/**
 * @since 1.0.0
 * @category symbols
 */
export type RecipientBehaviourContextTypeId = typeof RecipientBehaviourContextTypeId

/**
 * The context where a RecipientBehaviour is running, knows the current entityId, entityType, etc...
 * @since 1.0.0
 * @category models
 */
export interface RecipientBehaviourContext {
  readonly [RecipientBehaviourContextTypeId]: RecipientBehaviourContextTypeId
  readonly entityId: string
  readonly shardId: ShardId.ShardId
  readonly recipientType: RecipientType.RecipientType<Message.Message.Any>
  readonly forkShutdown: Effect.Effect<void>
}

/**
 * A tag to access current RecipientBehaviour
 * @since 1.0.0
 * @category context
 */
export const RecipientBehaviourContext: Context.Tag<RecipientBehaviourContext, RecipientBehaviourContext> =
  internal.recipientBehaviourContextTag

/**
 * Creates a new RecipientBehaviourContext
 * @since 1.0.0
 * @category constructors
 */
export const make: (
  args: Omit<RecipientBehaviourContext, typeof RecipientBehaviourContextTypeId>
) => RecipientBehaviourContext = internal.make

/**
 * Gets the current entityId
 * @since 1.0.0
 * @category utils
 */
export const entityId: Effect.Effect<string, never, RecipientBehaviourContext> = internal.entityId

/**
 * Gets the current shardId
 * @since 1.0.0
 * @category utils
 */
export const shardId: Effect.Effect<ShardId.ShardId, never, RecipientBehaviourContext> = internal.shardId

/**
 * Gets the current shardId
 * @since 1.0.0
 * @category utils
 */
export const recipientType: Effect.Effect<
  RecipientType.RecipientType<Message.Message.Any>,
  never,
  RecipientBehaviourContext
> = internal.recipientType

/**
 * Forks the shutdown of the current recipient
 * @since 1.0.0
 * @category utils
 */
export const forkShutdown: Effect.Effect<void, never, RecipientBehaviourContext> = internal.forkShutdown
