import type * as DurableExecutionEvent from "@effect/cluster-workflow/DurableExecutionEvent"
import type * as Schema from "@effect/schema/Schema"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"

export interface DurableExecutionJournal {
  read<IE, E, IA, A>(
    persistenceId: string,
    failure: Schema.Schema<IE, E>,
    success: Schema.Schema<IA, A>
  ): Stream.Stream<never, never, DurableExecutionEvent.DurableExecutionEvent<E, A>>
  append<IE, E, IA, A>(
    persistenceId: string,
    failure: Schema.Schema<IE, E>,
    success: Schema.Schema<IA, A>,
    event: DurableExecutionEvent.DurableExecutionEvent<E, A>
  ): Effect.Effect<never, never, void>
}

export const DurableExecutionJournal = Context.Tag<DurableExecutionJournal>()

export function append<IE, E, IA, A>(
  activityId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>,
  event: DurableExecutionEvent.DurableExecutionEvent<E, A>
) {
  return Effect.flatMap(
    DurableExecutionJournal,
    (journal) => journal.append(activityId, failure, success, event)
  )
}

export function read<IE, E, IA, A>(
  activityId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>
) {
  return Stream.flatMap(DurableExecutionJournal, (journal) => journal.read(activityId, failure, success))
}
