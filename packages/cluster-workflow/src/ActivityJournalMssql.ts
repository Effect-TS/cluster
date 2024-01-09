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

function persistJournal(activityId: string, event: ActivityEvent.ActivityEvent, sql: Mssql.MssqlClient) {
  return pipe(
    Schema.encode(Schema.parseJson(ActivityEvent.schema))(event),
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

function readJournal(activityId: string, sql: Mssql.MssqlClient) {
  return pipe(
    sql<
      { event_json: string }
    >`SELECT event_json FROM activity_journal WHERE activity_id = ${(activityId)} ORDER BY sequence ASC`,
    Effect.flatMap((result) =>
      Schema.decode(Schema.array(Schema.parseJson(ActivityEvent.schema)))(result.map((_) => _.event_json))
    ),
    Effect.orDie,
    Effect.map(Stream.fromIterable),
    Stream.unwrap
  )
}

export const activityJournalMssql = Layer.effect(
  ActivityJournal.ActivityJournal,
  Effect.gen(function*(_) {
    const sql = yield* _(Mssql.tag)
    return ({
      persistJournal: (activityId, event) => persistJournal(activityId, event, sql),
      readJournal: (activityId) => readJournal(activityId, sql)
    })
  })
)
