import * as AtLeastOnceStorageMysql from "@effect/cluster-node/AtLeastOnceStorageMysql"
import * as AtLeastOnce from "@effect/cluster/AtLeastOnce"
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
import * as MySql from "@sqlfx/mysql"
import { MySqlContainer } from "@testcontainers/mysql"
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

const testContainerMySqlLayer = Layer.scoped(
  MySql.tag,
  Effect.acquireUseRelease(
    Effect.promise(() => new MySqlContainer().start()),
    (container) => MySql.make({ url: Secret.fromString(container.getConnectionUri(true)) }),
    (container) => Effect.promise(() => container.stop())
  )
)

const SampleEntity = RecipientType.makeEntityType("SampleEntity", SampleMessage)

describe.concurrent("AtLeastOnceMySql", () => {
  const inMemorySharding = pipe(
    AtLeastOnceStorageMysql.atLeastOnceStorageMssql,
    Layer.provide(testContainerMySqlLayer),
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
    pipe(fa, Effect.provide(inMemorySharding), Effect.scoped, Logger.withMinimumLogLevel(LogLevel.Info))

  it("aaa", () => {
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
