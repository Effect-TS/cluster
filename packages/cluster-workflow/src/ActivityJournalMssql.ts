/**
 * @since 1.0.0
 */
import * as ActivityEvent from "@effect/cluster-workflow/ActivityEvent"
import * as ActivityJournal from "@effect/cluster-workflow/ActivityJournal"
import * as Schema from "@effect/schema/Schema"
import * as Mssql from "@sqlfx/mssql"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"

function persistJournal<IE, E, IA, A>(
  activityId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>,
  event: ActivityEvent.ActivityEvent<E, A>,
  sql: Mssql.MssqlClient
): Effect.Effect<never, never, void> {
  return pipe(
    Schema.encode(Schema.parseJson(ActivityEvent.schema(failure, success)))(event),
    Effect.flatMap((event_json) =>
      sql`INSERT INTO activity_journal ${
        sql.insert({
          activity_id: activityId,
          sequence: event.sequence,
          event_json
        })
      }`
    ),
    Effect.orDie
  )
}

function readJournal<IE, E, IA, A>(
  activityId: string,
  failure: Schema.Schema<IE, E>,
  success: Schema.Schema<IA, A>,
  sql: Mssql.MssqlClient
): Stream.Stream<never, never, ActivityEvent.ActivityEvent<E, A>> {
  return pipe(
    sql<
      { event_json: string }
    >`SELECT event_json FROM activity_journal WHERE activity_id = ${(activityId)} ORDER BY sequence ASC`,
    Effect.flatMap((result) =>
      Schema.decode(Schema.array(Schema.parseJson(ActivityEvent.schema(failure, success))))(
        result.map((_) => _.event_json)
      )
    ),
    Effect.map(Stream.fromIterable),
    Stream.unwrap,
    Stream.orDie
  )
}

export const activityJournalMssql = Layer.effect(
  ActivityJournal.ActivityJournal,
  Effect.gen(function*(_) {
    const sql = yield* _(Mssql.tag)
    return ({
      persistJournal: (activityId, failure, success, event) => persistJournal(activityId, failure, success, event, sql),
      readJournal: (activityId, failure, success) => readJournal(activityId, failure, success, sql)
    })
  })
)
