import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import * as Logger from "@effect/io/Logger"
import * as LogLevel from "@effect/io/Logger/Level"
import * as Ref from "@effect/io/Ref"
import * as PodsHttp from "@effect/sharding-node/PodsHttp"
import * as ShardingServiceHttp from "@effect/sharding-node/ShardingServiceHttp"
import * as ShardManagerClientHttp from "@effect/sharding-node/ShardManagerClientHttp"
import * as StorageFile from "@effect/sharding-node/StorageFile"
import * as PoisonPill from "@effect/sharding/PoisonPill"
import * as Serialization from "@effect/sharding/Serialization"
import * as Sharding from "@effect/sharding/Sharding"
import * as ShardingConfig from "@effect/sharding/ShardingConfig"
import * as ShardingImpl from "@effect/sharding/ShardingImpl"
import * as Stream from "@effect/stream/Stream"
import * as SubscriptionRef from "@effect/stream/SubscriptionRef"
import { CounterEntity } from "./sample-common"

const liveSharding = pipe(
  ShardingImpl.live,
  Layer.use(StorageFile.storageFile),
  Layer.use(PodsHttp.httpPods),
  Layer.use(ShardManagerClientHttp.shardManagerClientHttp),
  Layer.use(Serialization.json)
)

const program = pipe(
  Sharding.registerEntity(CounterEntity, (counterId, dequeue) =>
    pipe(
      SubscriptionRef.make(0),
      Effect.flatMap((count) =>
        pipe(
          PoisonPill.takeOrInterrupt(dequeue),
          Effect.flatMap(
            (msg) => {
              switch (msg._tag) {
                case "Increment":
                  return SubscriptionRef.update(count, (a) => a + 1)
                case "Decrement":
                  return SubscriptionRef.update(count, (a) => a - 1)
                case "GetCurrent":
                  return pipe(
                    SubscriptionRef.get(count),
                    Effect.flatMap((_) => msg.replier.reply(_))
                  )
                case "SubscribeChanges":
                  return msg.replier.reply(Stream.changes(count.changes))
              }
            }
          ),
          Effect.zipRight(Ref.get(count)),
          Effect.tap((_) => Effect.log("Counter " + counterId + " is now " + _)),
          Effect.forever
        )
      )
    )),
  Effect.zipRight(Sharding.register),
  Effect.zipRight(Effect.never),
  ShardingServiceHttp.shardingServiceHttp,
  Effect.scoped,
  Effect.catchAllCause(Effect.logError),
  Logger.withMinimumLogLevel(LogLevel.All),
  Effect.provideSomeLayer(liveSharding),
  Effect.provideSomeLayer(ShardingConfig.defaults)
)

Effect.runFork(program)
