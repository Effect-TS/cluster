import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import * as Logger from "@effect/io/Logger"
import * as ManagerConfig from "@effect/shardcake/ManagerConfig"
import * as PodsHealth from "@effect/shardcake/PodsHealth"
import * as PodsHttp from "@effect/shardcake/PodsHttp"
import * as ShardManager from "@effect/shardcake/ShardManager"
import * as StorageFile from "@effect/shardcake/StorageFile"

import * as LogLevel from "@effect/io/Logger/Level"
import * as ShardManagerHttp from "@effect/shardcake/ShardManagerHttp"

const liveShardingManager = pipe(
  ShardManager.live,
  Layer.use(StorageFile.storageFile),
  Layer.use(PodsHealth.local),
  Layer.use(PodsHttp.httpPods)
)

const program = pipe(
  Effect.never,
  ShardManagerHttp.shardManagerHttp,
  Effect.catchAllCause(Effect.logError),
  Logger.withMinimumLogLevel(LogLevel.All),
  Effect.provideSomeLayer(liveShardingManager),
  Effect.provideSomeLayer(ManagerConfig.defaults)
)

Effect.runFork(program)
