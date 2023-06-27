import { pipe } from "@effect/data/Function"
import * as Cause from "@effect/io/Cause"
import * as Effect from "@effect/io/Effect"
import * as Logger from "@effect/io/Logger"
import * as Config from "@effect/shardcake/Config"
import * as PodsHttp from "@effect/shardcake/PodsHttp"
import * as Serialization from "@effect/shardcake/Serialization"
import * as Sharding from "@effect/shardcake/Sharding"
import * as ShardingImpl from "@effect/shardcake/ShardingImpl"
import * as ShardManagerClientHttp from "@effect/shardcake/ShardManagerClientHttp"
import * as StorageFile from "@effect/shardcake/StorageFile"

import * as LogLevel from "@effect/io/Logger/Level"
import { CounterEntity, GetCurrent } from "./sample-common"

const program = pipe(
  Effect.flatMap(Sharding.Sharding, (sharding) =>
    pipe(
      Effect.Do(),
      Effect.let("messenger", () => sharding.messenger(CounterEntity)),
      Effect.tap((_) => _.messenger.sendDiscard("entity1")({ _tag: "Increment" })),
      Effect.tap((_) => _.messenger.sendDiscard("entity1")({ _tag: "Increment" })),
      Effect.flatMap((_) => _.messenger.send("entity1")(GetCurrent({ _tag: "GetCurrent" }))),
      Effect.tap((_) => Effect.log("Current count is " + _))
    )),
  Effect.zipRight(Effect.never()),
  Effect.scoped,
  Effect.provideSomeLayer(ShardingImpl.live),
  Effect.provideSomeLayer(StorageFile.storageFile),
  Effect.provideSomeLayer(PodsHttp.httpPods),
  Effect.provideSomeLayer(ShardManagerClientHttp.shardManagerClientHttp),
  Effect.provideSomeLayer(Config.defaults),
  Effect.provideSomeLayer(Serialization.json),
  Effect.catchAllCause((_) => Effect.log(Cause.pretty(_))),
  Logger.withMinimumLogLevel(LogLevel.All)
)

Effect.runFork(program)
