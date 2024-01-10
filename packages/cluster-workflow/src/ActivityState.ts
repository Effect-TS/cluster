import * as Data from "effect/Data"
import type * as Exit from "effect/Exit"

export class ActivityStatePending
  extends Data.TaggedClass("ActivityStatePending")<{ lastSequence: number; currentAttempt: number }>
{
}

export class ActivityStateCompleted<E, A> extends Data.TaggedClass("ActivityStateCompleted")<{
  lastSequence: number
  currentAttempt: number
  exit: Exit.Exit<E, A>
}> {
}

export type ActivityState<E, A> = ActivityStatePending | ActivityStateCompleted<E, A>

export function initialState<E, A>(): ActivityState<E, A> {
  return new ActivityStatePending({ lastSequence: 0, currentAttempt: 0 })
}

export function match<E, A, B, C = B>(fns: {
  onPending: (a: ActivityStatePending) => B
  onCompleted: (a: ActivityStateCompleted<E, A>) => C
}) {
  return (fa: ActivityState<E, A>) => {
    switch (fa._tag) {
      case "ActivityStatePending":
        return fns.onPending(fa)
      case "ActivityStateCompleted":
        return fns.onCompleted(fa)
    }
  }
}
