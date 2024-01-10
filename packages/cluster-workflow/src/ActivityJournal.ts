import * as ActivityEvent from "@effect/cluster-workflow/ActivityEvent"
import * as ActivityState from "@effect/cluster-workflow/ActivityState"
import * as Schema from "@effect/schema/Schema"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import type * as Exit from "effect/Exit"
import { pipe } from "effect/Function"
import * as Stream from "effect/Stream"

export interface ActivityJournal {
  readJournal(
    persistenceId: string
  ): Stream.Stream<never, never, ActivityEvent.ActivityEvent>
  persistJournal(
    persistenceId: string,
    event: ActivityEvent.ActivityEvent
  ): Effect.Effect<never, never, void>
}

export const ActivityJournal = Context.Tag<ActivityJournal>()

export function appendActivityAttempt(persistenceId: string, sequence: number) {
  return Effect.flatMap(
    ActivityJournal,
    (journal) => journal.persistJournal(persistenceId, new ActivityEvent.ActivityAttempted({ sequence }))
  )
}

export function appendActivityCompleted<I, E, A>(
  persistenceId: string,
  sequence: number,
  schema: Schema.Schema<I, Exit.Exit<E, A>>,
  value: Exit.Exit<E, A>
) {
  return Effect.flatMap(
    ActivityJournal,
    (journal) =>
      pipe(
        Schema.encode(Schema.parseJson(schema))(value),
        Effect.flatMap((result) =>
          journal.persistJournal(persistenceId, new ActivityEvent.ActivityCompleted({ sequence, result }))
        )
      )
  )
}

export function readState<I, E, A>(
  persistenceId: string,
  schema: Schema.Schema<I, Exit.Exit<E, A>>
) {
  return Effect.flatMap(ActivityJournal, (journal) =>
    pipe(
      journal.readJournal(persistenceId),
      Stream.runFoldEffect(ActivityState.initialState<E, A>(), (state, event) => {
        return ActivityEvent.match({
          onAttempted: ({ sequence }) =>
            Effect.succeed(
              new ActivityState.ActivityStatePending({
                lastSequence: sequence,
                currentAttempt: state.currentAttempt + 1
              })
            ),
          onCompleted: ({ result, sequence }) =>
            pipe(
              Schema.decode(Schema.parseJson(schema))(result),
              Effect.map((exit) =>
                new ActivityState.ActivityStateCompleted({
                  lastSequence: sequence,
                  currentAttempt: state.currentAttempt,
                  exit
                })
              )
            )
        })(event)
      })
    ))
}
