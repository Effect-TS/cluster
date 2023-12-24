import * as AtLeastOnceStoragePostgres from "@effect/cluster-node/AtLeastOnceStoragePostgres"
import * as PodsHttp from "@effect/cluster-node/PodsHttp"
import * as ShardingServiceHttp from "@effect/cluster-node/ShardingServiceHttp"
import * as ShardManagerClientHttp from "@effect/cluster-node/ShardManagerClientHttp"
import * as StorageFile from "@effect/cluster-node/StorageFile"
import * as AtLeastOnce from "@effect/cluster/AtLeastOnce"
import * as PoisonPill from "@effect/cluster/PoisonPill"
import * as RecipientBehaviour from "@effect/cluster/RecipientBehaviour"
import * as Serialization from "@effect/cluster/Serialization"
import * as Sharding from "@effect/cluster/Sharding"
import * as ShardingConfig from "@effect/cluster/ShardingConfig"
import * as NodeClient from "@effect/platform-node/Http/NodeClient"
import { runMain } from "@effect/platform-node/Runtime"
import * as Postgres from "@sqlfx/pg"
import * as Config from "effect/Config"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"
import * as Option from "effect/Option"
import * as Ref from "effect/Ref"
import * as SubscriptionRef from "effect/SubscriptionRef"
import { CounterEntity } from "./sample-common.js"

const liveSharding = pipe(
  Layer.scopedDiscard(AtLeastOnce.runPendingMessageSweeperScoped(Duration.seconds(10))),
  Layer.provideMerge(Sharding.live),
  Layer.provideMerge(AtLeastOnceStoragePostgres.atLeastOnceStoragePostgres),
  Layer.provide(StorageFile.storageFile),
  Layer.provide(PodsHttp.httpPods),
  Layer.provide(ShardManagerClientHttp.shardManagerClientHttp),
  Layer.provide(Serialization.json),
  Layer.provide(NodeClient.layer)
)

const programLayer = Layer.scopedDiscard(pipe(
  Sharding.registerEntity(
    CounterEntity,
    AtLeastOnce.atLeastOnceRecipientBehaviour(
      RecipientBehaviour.fromInMemoryQueue((entityId, dequeue, processed) =>
        pipe(
          SubscriptionRef.make(0),
          Effect.flatMap((count) =>
            pipe(
              PoisonPill.takeOrInterrupt(dequeue),
              Effect.flatMap(
                (msg) => {
                  switch (msg.payload._tag) {
                    case "Increment":
                      return pipe(
                        SubscriptionRef.update(count, (a) => a + 1),
                        Effect.zipRight(processed(msg, Option.none()))
                      )
                    case "Decrement":
                      return pipe(
                        SubscriptionRef.update(count, (a) => a - 1),
                        Effect.zipRight(processed(msg, Option.none()))
                      )
                    case "GetCurrent":
                      return pipe(
                        SubscriptionRef.get(count),
                        Effect.flatMap((result) => processed(msg, Option.some(result)))
                      )
                  }
                }
              ),
              Effect.zipRight(Ref.get(count)),
              Effect.tap((_) => Effect.log("Counter " + entityId + " is now " + _)),
              Effect.forever,
              Effect.withLogSpan(CounterEntity.name + "." + entityId)
            )
          )
        )
      )
    )
  ),
  Effect.zipRight(Sharding.registerScoped)
))

const liveLayer = pipe(
  programLayer,
  Layer.provide(ShardingServiceHttp.shardingServiceHttp),
  Layer.provide(liveSharding),
  Layer.provide(
    Postgres.makeLayer(Config.succeed({ host: "127.0.0.1", username: "postgres", database: "cluster" }))
  ),
  Layer.provide(ShardingConfig.defaults)
)

Layer.launch(liveLayer).pipe(
  Logger.withMinimumLogLevel(LogLevel.All),
  Effect.tapErrorCause(Effect.logError),
  runMain
)
