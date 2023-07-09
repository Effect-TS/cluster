import { pipe } from "@effect/data/Function"
import * as Cause from "@effect/io/Cause"
import * as Effect from "@effect/io/Effect"
import * as Logger from "@effect/io/Logger"
import * as ManagerConfig from "@effect/shardcake/ManagerConfig"
import * as PodsHealth from "@effect/shardcake/PodsHealth"
import * as PodsHttp from "@effect/shardcake/PodsHttp"
import * as ShardManager from "@effect/shardcake/ShardManager"
import * as StorageFile from "@effect/shardcake/StorageFile"

import * as LogLevel from "@effect/io/Logger/Level"
import * as ShardManagerHttp from "@effect/shardcake/ShardManagerHttp"

const program = pipe(
  Effect.never,
  ShardManagerHttp.shardManagerHttp,
  Effect.provideSomeLayer(ShardManager.live),
  Effect.provideSomeLayer(StorageFile.storageFile),
  Effect.provideSomeLayer(PodsHealth.local),
  Effect.provideSomeLayer(PodsHttp.httpPods),
  Effect.provideService(ManagerConfig.ManagerConfig, ManagerConfig.defaults),
  Effect.catchAllCause((_) => Effect.log(Cause.pretty(_))),
  Logger.withMinimumLogLevel(LogLevel.All)
)

Effect.runFork(program)
