/**
 * @since 1.0.0
 * This module provides the context that is given to a RecipientBehaviour
 */
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
  readonly recipientType: RecipientType.RecipientType<unknown>
  readonly forkShutdown: Effect.Effect<never, never, void>
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
export const entityId: Effect.Effect<RecipientBehaviourContext, never, string> = internal.entityId

/**
 * Gets the current shardId
 * @since 1.0.0
 * @category utils
 */
export const shardId: Effect.Effect<RecipientBehaviourContext, never, ShardId.ShardId> = internal.shardId

/**
 * Gets the current shardId
 * @since 1.0.0
 * @category utils
 */
export const recipientType: Effect.Effect<RecipientBehaviourContext, never, RecipientType.RecipientType<unknown>> =
  internal.recipientType

/**
 * Forks the shutdown of the current recipient
 * @since 1.0.0
 * @category utils
 */
export const forkShutdown: Effect.Effect<RecipientBehaviourContext, never, void> = internal.forkShutdown
