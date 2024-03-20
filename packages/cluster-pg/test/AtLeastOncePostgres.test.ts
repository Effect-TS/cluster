import * as AtLeastOnceStoragePostgres from "@effect/cluster-pg/AtLeastOnceStoragePostgres"
import * as AtLeastOnce from "@effect/cluster/AtLeastOnce"
import * as MessageState from "@effect/cluster/MessageState"
import * as Pods from "@effect/cluster/Pods"
import * as PodsHealth from "@effect/cluster/PodsHealth"
import * as RecipientBehaviour from "@effect/cluster/RecipientBehaviour"
import * as RecipientType from "@effect/cluster/RecipientType"
import * as Serialization from "@effect/cluster/Serialization"
import * as Sharding from "@effect/cluster/Sharding"
import * as ShardingConfig from "@effect/cluster/ShardingConfig"
import * as ShardManagerClient from "@effect/cluster/ShardManagerClient"
import * as Storage from "@effect/cluster/Storage"
import * as Schema from "@effect/schema/Schema"
import * as Postgres from "@sqlfx/pg"
import { PostgreSqlContainer } from "@testcontainers/postgresql"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"
import * as Option from "effect/Option"
import * as PrimaryKey from "effect/PrimaryKey"
import * as Secret from "effect/Secret"
import { describe, expect, it } from "vitest"

class SampleMessage extends Schema.TaggedRequest<SampleMessage>()("SampleMessage", Schema.never, Schema.void, {
  id: Schema.string,
  value: Schema.number
}) {
  [PrimaryKey.symbol]() {
    return this.id
  }
}

const testContainerPostgresLayer = pipe(
  Effect.acquireRelease(
    Effect.promise(() => new PostgreSqlContainer().start()),
    (container) => Effect.promise(() => container.stop())
  ),
  Effect.flatMap((container) => Postgres.make({ url: (Secret.fromString(container.getConnectionUri())) })),
  Layer.scoped(Postgres.tag)
)

const SampleEntity = RecipientType.makeEntityType("SampleEntity", SampleMessage)
type SampleEntity = SampleMessage

describe.concurrent("AtLeastOncePostgres", () => {
  const inMemorySharding = pipe(
    Sharding.live,
    Layer.merge(AtLeastOnceStoragePostgres.atLeastOnceStoragePostgres),
    Layer.provide(PodsHealth.local),
    Layer.provide(Pods.noop),
    Layer.provide(Storage.memory),
    Layer.provide(Serialization.json),
    Layer.provide(ShardManagerClient.local),
    Layer.provide(
      ShardingConfig.withDefaults({
        entityTerminationTimeout: Duration.millis(4000),
        sendTimeout: Duration.millis(1000)
      })
    )
  )

  const withTestEnv = <R, E, A>(fa: Effect.Effect<R, E, A>) =>
    pipe(
      fa,
      Effect.provide(inMemorySharding),
      Effect.provide(testContainerPostgresLayer),
      Effect.scoped,
      Logger.withMinimumLogLevel(LogLevel.Info)
    )

  it("Should create the message table upon layer creation", () => {
    return Effect.gen(function*(_) {
      const sql = yield* _(Postgres.tag)

      const rows = yield* _(sql<{ table_name: string }>`
        SELECT table_name
          FROM test.information_schema.tables
        WHERE table_schema='public'
          AND table_type='BASE TABLE'`)

      expect(rows).toEqual([{ table_name: "message_ack" }])
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Should store the message in the table upon send", () => {
    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)

      yield* _(
        Sharding.registerEntity(
          SampleEntity
        )(
          pipe(
            RecipientBehaviour.fromFunctionEffect(() => Effect.succeed(MessageState.Acknowledged)),
            AtLeastOnce.atLeastOnceRecipientBehaviour
          )
        )
      )

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      const msg = new SampleMessage({ id: "a", value: 42 })
      yield* _(messenger.sendDiscard("entity1")(msg))

      const sql = yield* _(Postgres.tag)
      const rows = yield* _(sql<{ message_id: string }>`SELECT message_id FROM message_ack`)

      expect(rows.length).toBe(1)
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Should mark as processed if message state is processed", () => {
    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)

      yield* _(
        Sharding.registerEntity(
          SampleEntity
        )(
          pipe(
            RecipientBehaviour.fromFunctionEffect(() => Effect.succeed(MessageState.Processed(Option.none()))),
            AtLeastOnce.atLeastOnceRecipientBehaviour
          )
        )
      )

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      const msg = new SampleMessage({ id: "a", value: 42 })
      yield* _(messenger.sendDiscard("entity1")(msg))

      const sql = yield* _(Postgres.tag)
      const rows = yield* _(sql<{ message_id: string }>`SELECT message_id FROM message_ack WHERE processed = TRUE`)

      expect(rows.length).toBe(1)
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Should not mark as processed if message state is acknowledged", () => {
    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)

      yield* _(
        Sharding.registerEntity(
          SampleEntity
        )(
          pipe(
            RecipientBehaviour.fromFunctionEffect(() => Effect.succeed(MessageState.Acknowledged)),
            AtLeastOnce.atLeastOnceRecipientBehaviour
          )
        )
      )

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      yield* _(messenger.sendDiscard("entity1")(new SampleMessage({ id: "a", value: 42 })))

      const sql = yield* _(Postgres.tag)
      const rows = yield* _(sql<{ message_id: string }>`SELECT message_id FROM message_ack WHERE processed = FALSE`)

      expect(rows.length).toBe(1)
    }).pipe(withTestEnv, Effect.runPromise)
  })
}, { timeout: 60000 })
