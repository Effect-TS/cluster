import * as ActivityEvent from "@effect/cluster-workflow/ActivityEvent"
import * as ActivityState from "@effect/cluster-workflow/ActivityState"
import * as Schema from "@effect/schema/Schema"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import { pipe } from "effect/Function"
import * as Option from "effect/Option"
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

export function appendActivityCompleted(persistenceId: string, sequence: number) {
  return Effect.flatMap(
    ActivityJournal,
    (journal) => journal.persistJournal(persistenceId, new ActivityEvent.ActivityCompleted({ sequence }))
  )
}

export function appendActivitySucceded<IA, A>(
  persistenceId: string,
  sequence: number,
  schema: Schema.Schema<IA, A>,
  value: A
) {
  return Effect.flatMap(
    ActivityJournal,
    (journal) =>
      pipe(
        Schema.encode(Schema.parseJson(schema))(value),
        Effect.flatMap((result) =>
          journal.persistJournal(persistenceId, new ActivityEvent.ActivitySucceeded({ sequence, result }))
        )
      )
  )
}

export function appendActivityFailed<IE, E>(
  persistenceId: string,
  sequence: number,
  schema: Schema.Schema<IE, E>,
  value: E
) {
  return Effect.flatMap(
    ActivityJournal,
    (journal) =>
      pipe(
        Schema.encode(Schema.parseJson(schema))(value),
        Effect.flatMap((result) =>
          journal.persistJournal(persistenceId, new ActivityEvent.ActivityFailed({ sequence, result }))
        )
      )
  )
}

export function readState<IE, E, IA, A>(
  persistenceId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  return Effect.flatMap(ActivityJournal, (journal) =>
    pipe(
      journal.readJournal(persistenceId),
      Stream.runFoldEffect(ActivityState.initialState<E, A>(), (state, event) => {
        return ActivityEvent.match({
          onAttempted: ({ sequence }) =>
            Effect.succeed({ ...state, sequence, currentAttempt: state.currentAttempt + 1 }),
          onFailed: ({ result, sequence }) =>
            pipe(
              Schema.decode(Schema.parseJson(failure))(result),
              Effect.map((failure) => ({ ...state, sequence, exit: Option.some(Exit.fail(failure)) }))
            ),
          onSucceeded: ({ result, sequence }) =>
            pipe(
              Schema.decode(Schema.parseJson(success))(result),
              Effect.map((result) => ({ ...state, sequence, exit: Option.some(Exit.succeed(result)) }))
            ),
          onCompleted: ({ sequence }) => Effect.succeed({ ...state, sequence, exit: Option.some(Exit.unit as any) })
        })(event)
      })
    ))
}
