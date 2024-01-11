import * as ActivityJournal from "@effect/cluster-workflow/ActivityJournal"
import * as ActivityState from "@effect/cluster-workflow/ActivityState"
import * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import type * as Exit from "effect/Exit"
import { pipe } from "effect/Function"
import * as Stream from "effect/Stream"
import * as ActivityContext from "./ActivityContext.js"
import * as ActivityError from "./ActivityError.js"
import * as ActivityEvent from "./ActivityEvent.js"

function executeAttemptPath<IE, E, IA, A>(
  activityId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  return <R>(
    execute: Effect.Effect<R, E, A>,
    state: ActivityState.ActivityState<E | ActivityError.ActivityError, A>
  ) =>
    pipe(
      Effect.logDebug("Attempt #" + state.currentAttempt + " of " + activityId + "..."),
      Effect.zipRight(ActivityJournal.persistJournal(
        activityId,
        failure,
        success,
        ActivityEvent.ActivityAttempted(
          state.lastSequence + 1
        )
      )),
      Effect.zipRight(execute),
      Effect.catchAllDefect((defect) => Effect.die(String(defect))),
      Effect.exit,
      Effect.tap((exit) =>
        ActivityJournal.persistJournal(
          activityId,
          failure,
          success,
          ActivityEvent.ActivityCompleted(
            state.lastSequence + 2,
            exit
          )
        )
      ),
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
  return <R>(execute: Effect.Effect<R | ActivityContext.ActivityContext, E, A>) => {
    const failureWithActivityError = Schema.union(failure, ActivityError.ActivityError)
    return pipe(
      ActivityJournal.readJournal(activityId, failure, success),
      Stream.runFold(
        ActivityState.initialState<E, A>(),
        (state, event) => ActivityState.foldActivityEvent(state, event)
      ),
      Effect.flatMap(ActivityState.match({
        onPending: (state) => executeAttemptPath(activityId, failure, success)(execute, state),
        onCompleted: ({ exit }) => resumeFromStoragePath(activityId)(exit)
      })),
      Effect.catchAllDefect((defect) => Effect.fail(new ActivityError.ActivityError({ error: String(defect) })))
    )
  }
}

export const currentAttempt = Effect.map(ActivityContext.ActivityContext, (_) => _.currentAttempt)
