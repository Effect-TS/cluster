import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import * as Logger from "@effect/io/Logger"
import * as Ref from "@effect/io/Ref"
import * as PodsHttp from "@effect/shardcake/PodsHttp"
import * as PoisonPill from "@effect/shardcake/PoisonPill"
import * as Serialization from "@effect/shardcake/Serialization"
import * as Sharding from "@effect/shardcake/Sharding"
import * as ShardingConfig from "@effect/shardcake/ShardingConfig"
import * as ShardingImpl from "@effect/shardcake/ShardingImpl"
import * as ShardingServiceHttp from "@effect/shardcake/ShardingServiceHttp"
import * as ShardManagerClientHttp from "@effect/shardcake/ShardManagerClientHttp"
import * as StorageFile from "@effect/shardcake/StorageFile"
import * as Stream from "@effect/stream/Stream"
import * as SubscriptionRef from "@effect/stream/SubscriptionRef"

import * as LogLevel from "@effect/io/Logger/Level"
import * as MessageQueue from "@effect/shardcake/MessageQueue"
import { CounterEntity } from "./sample-common"

const liveSharding = pipe(
  ShardingImpl.live,
  Layer.use(StorageFile.storageFile),
  Layer.use(PodsHttp.httpPods),
  Layer.use(ShardManagerClientHttp.shardManagerClientHttp),
  Layer.use(Serialization.json),
  Layer.merge(MessageQueue.inMemory)
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
