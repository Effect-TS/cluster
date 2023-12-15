/**
 * @since 1.0.0
 * This module provides the context that is given to a RecipientBehaviour
 */
import type * as Context from "effect/Context"
import type * as Effect from "effect/Effect"
import * as internal from "./internal/recipientBehaviourContext.js"

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
