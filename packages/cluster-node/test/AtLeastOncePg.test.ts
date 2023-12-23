import * as AtLeastOnceStoragePostgres from "@effect/cluster-node/AtLeastOnceStoragePostgres"
import * as AtLeastOnce from "@effect/cluster/AtLeastOnce"
import * as AtLeastOnceStorage from "@effect/cluster/AtLeastOnceStorage"
import * as Message from "@effect/cluster/Message"
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
import * as Pg from "@sqlfx/pg"
import { PostgreSqlContainer } from "@testcontainers/postgresql"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"
import * as Secret from "effect/Secret"
import { describe, expect, it } from "vitest"

const SampleMessage = Message.schema(
  Schema.number
)

const testContainerPostgresLayer = pipe(
  Effect.acquireRelease(
    Effect.promise(() => new PostgreSqlContainer().start()),
    (container) => Effect.promise(() => container.stop())
  ),
  Effect.flatMap((container) => Pg.make({ url: Secret.fromString(container.getConnectionUri()) })),
  Layer.scoped(Pg.tag)
)

const SampleEntity = RecipientType.makeEntityType("SampleEntity", SampleMessage)

describe.concurrent("AtLeastOncePg", () => {
  const inMemorySharding = pipe(
    AtLeastOnceStoragePostgres.atLeastOnceStoragePostgres,
    Layer.provide(testContainerPostgresLayer),
    Layer.provideMerge(Sharding.live),
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
      const sql = yield* _(Pg.tag)
      const storage = yield* _(AtLeastOnceStorage.Tag)

      const rows = yield* _(sql<{ table_name: string }>`
        SELECT table_name
          FROM information_schema.tables
        WHERE table_schema='public'
          AND table_type='BASE TABLE'`)

      expect(rows).toBe(true)
    }).pipe(withTestEnv, Effect.runPromise)
  }, 100000)

  it.skip("Should create the message table upon layer creation", () => {
    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)

      yield* _(
        Sharding.registerEntity(
          SampleEntity,
          pipe(
            RecipientBehaviour.fromFunctionEffect(() => Effect.succeed(MessageState.Acknowledged)),
            AtLeastOnce.atLeastOnceRecipientBehaviour
          )
        )
      )

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      const msg = yield* _(SampleMessage.makeEffect(42))
      yield* _(messenger.sendDiscard("entity1")(msg))

      expect(true).toBe(true)
    }).pipe(withTestEnv, Effect.runPromise)
  }, 100000)
})
