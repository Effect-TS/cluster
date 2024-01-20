import * as Context from "effect/Context"

export interface ActivityContext {
  activityId: string
  currentAttempt: number
}

export const ActivityContext = Context.Tag<ActivityContext>()
