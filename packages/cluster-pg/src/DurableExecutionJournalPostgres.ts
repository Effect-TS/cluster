/**
 * @since 1.0.0
 */
import * as DurableExecutionEvent from "@effect/cluster-workflow/DurableExecutionEvent"
import * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import * as Schema from "@effect/schema/Schema"
import * as Pg from "@sqlfx/pg"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"

function append<A, IA, E, IE>(
  persistenceId: string,
  success: Schema.Schema<A, IA>,
  failure: Schema.Schema<E, IE>,
  event: DurableExecutionEvent.DurableExecutionEvent<A, E>,
  sql: Pg.PgClient
): Effect.Effect<void> {
  return pipe(
    Schema.encode(Schema.parseJson(DurableExecutionEvent.schema(success, failure)))(event),
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

function read<A, IA, E, IE>(
  executionId: string,
  success: Schema.Schema<A, IA>,
  failure: Schema.Schema<E, IE>,
  fromSequence: number,
  sql: Pg.PgClient
): Stream.Stream<DurableExecutionEvent.DurableExecutionEvent<A, E>> {
  return pipe(
    sql<
      { event_json: string }
    >`SELECT event_json FROM execution_journal WHERE execution_id = ${(executionId)} AND sequence >= ${fromSequence} ORDER BY sequence ASC`,
    Effect.flatMap((result) =>
      Schema.decode(Schema.array(Schema.parseJson(DurableExecutionEvent.schema(success, failure))))(
        result.map((_) => _.event_json)
      )
    ),
    Effect.map(Stream.fromIterable),
    Stream.unwrap,
    Stream.orDie
  )
}

export const DurableExecutionJournalPostgres = Layer.effect(
  DurableExecutionJournal.DurableExecutionJournal,
  Effect.gen(function*(_) {
    const sql = yield* _(Pg.tag)

    yield* _(sql`
    CREATE TABLE IF NOT EXISTS execution_journal
    (
        execution_id varchar(255) NOT NULL,
        sequence integer DEFAULT 0,
        event_json text NOT NULL,
        CONSTRAINT execution_journal_pkey PRIMARY KEY (execution_id, sequence)
    )
    `)

    return ({
      append: (executionId, success, failure, event) => append(executionId, success, failure, event, sql),
      read: (executionId, success, failure, fromSequence) => read(executionId, success, failure, fromSequence, sql)
    })
  })
)
