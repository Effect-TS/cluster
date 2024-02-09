import * as Context from "effect/Context"

export interface ActivityContext {
  persistenceId: string
  currentAttempt: number
}

export const ActivityContext = Context.GenericTag<ActivityContext>("@services/ActivityContext")
