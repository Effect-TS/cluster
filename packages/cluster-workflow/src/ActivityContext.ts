/**
 * @since 1.0.0
 */
import * as Context from "effect/Context"

/**
 * @since 1.0.0
 */
export interface ActivityContext {
  persistenceId: string
  currentAttempt: number
}

/**
 * @since 1.0.0
 */
export const ActivityContext = Context.GenericTag<ActivityContext>("@services/ActivityContext")
