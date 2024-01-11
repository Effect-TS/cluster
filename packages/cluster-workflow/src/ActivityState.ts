import * as ActivityEvent from "@effect/cluster-workflow/ActivityEvent"
import * as Data from "effect/Data"
import type * as Exit from "effect/Exit"
import { pipe } from "effect/Function"

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

export function foldActivityEvent<E, A>(
  state: ActivityState<E, A>,
  event: ActivityEvent.ActivityEvent<E, A>
): ActivityState<E, A> {
  return pipe(
    event,
    ActivityEvent.match({
      onAttempted: ({ sequence }) => (
        new ActivityStatePending({
          lastSequence: sequence,
          currentAttempt: state.currentAttempt + 1
        })
      ),
      onCompleted: ({ exit, sequence }) =>
        new ActivityStateCompleted({
          lastSequence: sequence,
          currentAttempt: state.currentAttempt,
          exit
        })
    })
  )
}
