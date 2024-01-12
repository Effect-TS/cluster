import * as ActivityJournal from "@effect/cluster-workflow/ActivityJournal"
import * as ActivityState from "@effect/cluster-workflow/ActivityState"
import type * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import type * as Exit from "effect/Exit"
import { pipe } from "effect/Function"
import * as Stream from "effect/Stream"
import * as ActivityContext from "./ActivityContext.js"
import * as ActivityError from "./ActivityError.js"
import * as ActivityEvent from "./ActivityEvent.js"
import * as WorkflowContext from "./WorkflowContext.js"

function executeAttemptPath<IE, E, IA, A>(
  activityId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  const persistEventIntoJournal = (event: ActivityEvent.ActivityEvent<E, A>) =>
    ActivityJournal.persistJournal(activityId, failure, success, event)

  return <R>(
    execute: Effect.Effect<R, E, A>,
    state: ActivityState.ActivityState<E | ActivityError.ActivityError, A>
  ) =>
    pipe(
      Effect.logDebug("Attempt #" + state.currentAttempt + " of " + activityId + "..."),
      Effect.zipRight(persistEventIntoJournal(
        ActivityEvent.ActivityAttempted(
          state.lastSequence + 1
        )
      )),
      Effect.zipRight(pipe(
        execute,
        WorkflowContext.forkEffectInExecutionScope
      )),
      Effect.flatMap((_) => _.await),
      Effect.tap((exit) =>
        persistEventIntoJournal(
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
    return pipe(
      ActivityJournal.readJournal(activityId, failure, success),
      Stream.runFold(
        ActivityState.initialState<E, A>(),
        (state, event) => ActivityState.foldActivityEvent(state, event)
      ),
      Effect.flatMap((_) =>
        pipe(
          ActivityState.match(_, {
            onPending: (state) => executeAttemptPath(activityId, failure, success)(execute, state),
            onCompleted: ({ exit }) => resumeFromStoragePath(activityId)(exit)
          }),
          Effect.unified
        )
      ),
      WorkflowContext.withOuterScheduler,
      Effect.catchAllDefect((defect) => Effect.fail(new ActivityError.ActivityError({ error: String(defect) })))
    )
  }
}

export const currentAttempt = Effect.map(ActivityContext.ActivityContext, (_) => _.currentAttempt)
