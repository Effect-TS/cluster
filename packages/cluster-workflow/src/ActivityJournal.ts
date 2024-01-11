import type * as ActivityEvent from "@effect/cluster-workflow/ActivityEvent"
import type * as Schema from "@effect/schema/Schema"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"

/**
 * NOTE:
 * - Persistence should be retried forever and be treated as unfailable
 * - ParseError/SerializeError should be treated as an ActivityError defect
 */

export interface ActivityJournal {
  readJournal<IE, E, IA, A>(
    persistenceId: string,
    failure: Schema.Schema<IE, E>,
    success: Schema.Schema<IA, A>
  ): Stream.Stream<never, never, ActivityEvent.ActivityEvent<E, A>>
  persistJournal<IE, E, IA, A>(
    persistenceId: string,
    failure: Schema.Schema<IE, E>,
    success: Schema.Schema<IA, A>,
    event: ActivityEvent.ActivityEvent<E, A>
  ): Effect.Effect<never, never, void>
}

export const ActivityJournal = Context.Tag<ActivityJournal>()

export function persistJournal<IE, E, IA, A>(
  persistenceId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>,
  event: ActivityEvent.ActivityEvent<E, A>
) {
  return Effect.flatMap(ActivityJournal, (journal) => journal.persistJournal(persistenceId, failure, success, event))
}

export function readJournal<IE, E, IA, A>(
  persistenceId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  return Stream.flatMap(ActivityJournal, (journal) => journal.readJournal(persistenceId, failure, success))
}
