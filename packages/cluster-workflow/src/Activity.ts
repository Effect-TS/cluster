import * as ActivityJournal from "@effect/cluster-workflow/ActivityJournal"
import type * as ActivityState from "@effect/cluster-workflow/ActivityState"
import type * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import type * as Exit from "effect/Exit"
import { pipe } from "effect/Function"
import * as Option from "effect/Option"
import * as ActivityContext from "./ActivityContext.js"

function executeAttemptPath<IE, E, IA, A>(
  activityId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  return <R>(
    execute: Effect.Effect<R, E, A>,
    state: ActivityState.ActivityState<E, A>
  ) =>
    pipe(
      Effect.logDebug("Attempt #" + state.currentAttempt + " of " + activityId + "..."),
      Effect.zipRight(ActivityJournal.appendActivityAttempt(activityId, state.sequence + 1)),
      Effect.zipRight(execute),
      Effect.tapBoth({
        onSuccess: (result) =>
          result === void 0
            ? ActivityJournal.appendActivityCompleted(activityId, state.sequence + 2)
            : ActivityJournal.appendActivitySucceded(activityId, state.sequence + 2, success, result),
        onFailure: (error) => ActivityJournal.appendActivityFailed(activityId, state.sequence + 2, failure, error)
      }),
      Effect.provideService(ActivityContext.ActivityContext, { activityId, currentAttempt: state.currentAttempt })
    )
}

function resumeFromStoragePath(
  activityId: string
) {
  return <E, A>(
    exit: Exit.Exit<E, A>
  ) =>
    pipe(
      Effect.logDebug(activityId + " execution skipped"),
      Effect.zipRight(exit)
    )
}

export function make<IE, E, IA, A>(
  activityId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  return <R>(execute: Effect.Effect<R | ActivityContext.ActivityContext, E, A>) =>
    pipe(
      ActivityJournal.readState(activityId, failure, success),
      Effect.flatMap((state) =>
        Option.match(state.exit, {
          onNone: () => executeAttemptPath(activityId, failure, success)(execute, state),
          onSome: (previousExecutionExit) => resumeFromStoragePath(activityId)(previousExecutionExit)
        })
      )
    )
}

export const currentAttempt = Effect.map(ActivityContext.ActivityContext, (_) => _.currentAttempt)
