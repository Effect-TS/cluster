/**
 * @since 1.0.0
 */
import type * as DurableExecutionEvent from "@effect/cluster-workflow/DurableExecutionEvent"
import type * as Schema from "@effect/schema/Schema"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"

/**
 * @since 1.0.0
 */
export interface DurableExecutionJournal {
  read<A, IA, E, IE>(
    persistenceId: string,
    success: Schema.Schema<A, IA>,
    failure: Schema.Schema<E, IE>,
    fromSequence: number,
    keepReading: boolean
  ): Stream.Stream<DurableExecutionEvent.DurableExecutionEvent<A, E>>
  append<A, IA, E, IE>(
    persistenceId: string,
    success: Schema.Schema<A, IA>,
    failure: Schema.Schema<E, IE>,
    event: DurableExecutionEvent.DurableExecutionEvent<A, E>
  ): Effect.Effect<void>
}

/**
 * @since 1.0.0
 */
export const DurableExecutionJournal = Context.GenericTag<DurableExecutionJournal>("@services/DurableExecutionJournal")

/**
 * @since 1.0.0
 */
export function read<A, IA, E, IE>(
  activityId: string,
  success: Schema.Schema<A, IA>,
  failure: Schema.Schema<E, IE>,
  fromSequence: number,
  keepReading: boolean
) {
  return Stream.flatMap(
    DurableExecutionJournal,
    (journal) => journal.read(activityId, success, failure, fromSequence, keepReading)
  )
}

/**
 * @since 1.0.0
 */
export function append<A, IA, E, IE>(
  activityId: string,
  success: Schema.Schema<A, IA>,
  failure: Schema.Schema<E, IE>,
  event: DurableExecutionEvent.DurableExecutionEvent<A, E>
) {
  return Effect.flatMap(
    DurableExecutionJournal,
    (journal) => journal.append(activityId, success, failure, event)
  )
}
