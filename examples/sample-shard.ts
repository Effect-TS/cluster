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

import * as LogLevel from "@effect/io/Logger/Level"
import { CounterEntity } from "./sample-common"

const program = pipe(
  Effect.flatMap(Sharding.Sharding, (sharding) =>
    pipe(
      sharding.registerEntity(CounterEntity, (counterId, dequeue) =>
        pipe(
          Ref.make(0),
          Effect.flatMap((count) =>
            pipe(
              Queue.take(dequeue),
              Effect.flatMap(
                (msg) => ({
                  Increment: Ref.update(count, (a) => a + 1),
                  Decrement: Ref.update(count, (a) => a - 1),
                  GetCurrent: pipe(
                    Ref.get(count),
                    Effect.flatMap((_) => msg._tag === "GetCurrent" ? msg.replier.reply(_) : Effect.unit())
                  )
                }[msg._tag])
              ),
              Effect.zipRight(Ref.get(count)),
              Effect.tap((_) => Effect.log("Counter " + counterId + " is now " + _)),
              Effect.forever
            )
          )
        )),
      Effect.zipRight(sharding.registerScoped)
    )),
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
