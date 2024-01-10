import * as ActivityJournal from "@effect/cluster-workflow/ActivityJournal"
import * as ActivityState from "@effect/cluster-workflow/ActivityState"
import * as Schema from "@effect/schema/Schema"
import * as Effect from "effect/Effect"
import type * as Exit from "effect/Exit"
import { pipe } from "effect/Function"
import * as ActivityContext from "./ActivityContext.js"
import * as ActivityError from "./ActivityError.js"

function exitSchema<IE, E, IA, A>(
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  return Schema.exit(Schema.union(failure, ActivityError.ActivityError), success)
}

function executeAttemptPath<I, E, A>(
  activityId: string,
  schema: Schema.Schema<I, Exit.Exit<E | ActivityError.ActivityError, A>>
) {
  return <R>(
    execute: Effect.Effect<R, E, A>,
    state: ActivityState.ActivityState<E | ActivityError.ActivityError, A>
  ) =>
    pipe(
      Effect.logDebug("Attempt #" + state.currentAttempt + " of " + activityId + "..."),
      Effect.zipRight(ActivityJournal.appendActivityAttempt(activityId, state.lastSequence + 1)),
      Effect.zipRight(execute),
      Effect.catchAllDefect((defect) => Effect.fail(new ActivityError.ActivityError({ error: String(defect) }))),
      Effect.exit,
      Effect.flatMap((exit) =>
        pipe(
          ActivityJournal.appendActivityCompleted(
            activityId,
            state.lastSequence + 2,
            schema,
            exit
          ),
          Effect.zipRight(exit)
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
    const schema = exitSchema(failure, success)
    return pipe(
      ActivityJournal.readState(activityId, schema),
      Effect.flatMap(ActivityState.match({
        onPending: (state) => executeAttemptPath(activityId, schema)(execute, state),
        onCompleted: ({ exit }) => resumeFromStoragePath(activityId)(exit)
      })),
      Effect.catchAllDefect((defect) => Effect.fail(new ActivityError.ActivityError({ error: String(defect) })))
    )
  }
}

export const currentAttempt = Effect.map(ActivityContext.ActivityContext, (_) => _.currentAttempt)
