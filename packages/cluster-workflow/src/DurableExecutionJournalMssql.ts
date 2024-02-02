/**
 * @since 1.0.0
 */
import * as DurableExecutionEvent from "@effect/cluster-workflow/DurableExecutionEvent"
import * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import * as Schema from "@effect/schema/Schema"
import * as Mssql from "@sqlfx/mssql"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"

function append<IE, E, IA, A>(
  persistenceId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>,
  event: DurableExecutionEvent.DurableExecutionEvent<E, A>,
  sql: Mssql.MssqlClient
): Effect.Effect<never, never, void> {
  return pipe(
    Schema.encode(Schema.parseJson(DurableExecutionEvent.schema(failure, success)))(event),
    Effect.flatMap((event_json) =>
      sql`INSERT INTO execution_journal ${
        sql.insert({
          execution_id: persistenceId,
          sequence: event.sequence,
          event_json
        })
      }`
    ),
    Effect.orDie
  )
}

function read<IE, E, IA, A>(
  activityId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>,
  sql: Mssql.MssqlClient
): Stream.Stream<never, never, DurableExecutionEvent.DurableExecutionEvent<E, A>> {
  return pipe(
    sql<
      { event_json: string }
    >`SELECT event_json FROM execution_journal WHERE persistence_id = ${(activityId)} ORDER BY sequence ASC`,
    Effect.flatMap((result) =>
      Schema.decode(Schema.array(Schema.parseJson(DurableExecutionEvent.schema(failure, success))))(
        result.map((_) => _.event_json)
      )
    ),
    Effect.map(Stream.fromIterable),
    Stream.unwrap,
    Stream.orDie
  )
}

export const durableExecutionJournalMssql = Layer.effect(
  DurableExecutionJournal.DurableExecutionJournal,
  Effect.gen(function*(_) {
    const sql = yield* _(Mssql.tag)
    return ({
      append: (persistenceId, failure, success, event) => append(persistenceId, failure, success, event, sql),
      read: (activityId, failure, success) => read(activityId, failure, success, sql)
    })
  })
)
