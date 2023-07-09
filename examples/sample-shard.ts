import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import * as Logger from "@effect/io/Logger"
import * as Queue from "@effect/io/Queue"
import * as Ref from "@effect/io/Ref"
import * as PodsHttp from "@effect/shardcake/PodsHttp"
import * as Serialization from "@effect/shardcake/Serialization"
import * as Sharding from "@effect/shardcake/Sharding"
import * as ShardingConfig from "@effect/shardcake/ShardingConfig"
import * as ShardingImpl from "@effect/shardcake/ShardingImpl"
import * as ShardingServiceHttp from "@effect/shardcake/ShardingServiceHttp"
import * as ShardManagerClientHttp from "@effect/shardcake/ShardManagerClientHttp"
import * as StorageFile from "@effect/shardcake/StorageFile"
import * as SubscriptionRef from "@effect/stream/SubscriptionRef"

import * as LogLevel from "@effect/io/Logger/Level"
import { CounterEntity } from "./sample-common"

const program = pipe(
  Sharding.registerEntity(CounterEntity, (counterId, dequeue) =>
    pipe(
      SubscriptionRef.make(0),
      Effect.flatMap((count) =>
        pipe(
          Queue.take(dequeue),
          Effect.flatMap(
            (msg) => {
              switch (msg._tag) {
                case "Increment":
                  return SubscriptionRef.update(count, (a) => a + 1)
                case "Decrement":
                  return SubscriptionRef.update(count, (a) => a + 1)
                case "GetCurrent":
                  return pipe(
                    SubscriptionRef.get(count),
                    Effect.flatMap((_) => msg._tag === "GetCurrent" ? msg.replier.reply(_) : Effect.unit())
                  )
                case "SubscribeChanges":
                  return msg.replier.reply(count.changes)
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
  Effect.zipRight(Effect.never()),
  ShardingServiceHttp.shardingServiceHttp,
  Effect.scoped,
  Effect.provideSomeLayer(ShardingImpl.live),
  Effect.provideSomeLayer(StorageFile.storageFile),
  Effect.provideSomeLayer(PodsHttp.httpPods),
  Effect.provideSomeLayer(ShardManagerClientHttp.shardManagerClientHttp),
  Effect.provideSomeLayer(ShardingConfig.defaults),
  Effect.provideSomeLayer(Serialization.json),
  Effect.catchAllCause(Effect.logErrorCause),
  Logger.withMinimumLogLevel(LogLevel.All)
)

Effect.runFork(program)
