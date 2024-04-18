import * as DurableExecutionJournalPostgres from "@effect/cluster-pg/DurableExecutionJournalPostgres"
import * as DurableExecutionEvent from "@effect/cluster-workflow/DurableExecutionEvent"
import * as DurableExecutionJournal from "@effect/cluster-workflow/DurableExecutionJournal"
import * as Schema from "@effect/schema/Schema"
import * as Pg from "@effect/sql-pg"
import { PostgreSqlContainer } from "@testcontainers/postgresql"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"
import * as Secret from "effect/Secret"
import * as Stream from "effect/Stream"
import { describe, expect, it } from "vitest"

const testContainerPostgresLayer = pipe(
  Effect.acquireRelease(
    Effect.promise(() => new PostgreSqlContainer().start()),
    (container) => Effect.promise(() => container.stop())
  ),
  Effect.flatMap((container) => Pg.client.make({ url: (Secret.fromString(container.getConnectionUri())) })),
  Layer.scoped(Pg.client.PgClient)
)

describe.concurrent("DurableExecutionJournalPostgres", () => {
  const withTestEnv = <R, E, A>(fa: Effect.Effect<R, E, A>) =>
    pipe(
      fa,
      Effect.provide(DurableExecutionJournalPostgres.DurableExecutionJournalPostgres),
      Effect.provide(testContainerPostgresLayer),
      Effect.scoped,
      Logger.withMinimumLogLevel(LogLevel.Info)
    )

  it("Should create the execution table upon layer creation", () => {
    return Effect.gen(function*(_) {
      const sql = yield* _(Pg.client.PgClient)

      const rows = yield* _(sql<{ table_name: string }>`
        SELECT table_name
          FROM test.information_schema.tables
        WHERE table_schema='public'
          AND table_type='BASE TABLE'`)

      expect(rows).toEqual([{ table_name: "execution_journal" }])
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Should store the execution in the table upon append", () => {
    return Effect.gen(function*(_) {
      const journal = yield* _(DurableExecutionJournal.DurableExecutionJournal)

      yield* _(
        journal.append("test", Schema.Never, Schema.Void, DurableExecutionEvent.Attempted(0)(0))
      )

      const sql = yield* _(Pg.client.PgClient)
      const rows = yield* _(sql<{ message_id: string }>`SELECT execution_id FROM execution_journal`)

      expect(rows.length).toBe(1)
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Should read records after persisting them", () => {
    return Effect.gen(function*(_) {
      const journal = yield* _(DurableExecutionJournal.DurableExecutionJournal)

      yield* _(
        journal.append("test", Schema.Never, Schema.Void, DurableExecutionEvent.Attempted(0)(0))
      )

      const count = yield* _(
        journal.read("test", Schema.Never, Schema.Void, 0, false),
        Stream.runCount
      )

      expect(count).toBe(1)
    }).pipe(withTestEnv, Effect.runPromise)
  })
}, { timeout: 60000 })
