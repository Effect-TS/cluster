import { pipe } from "effect/Function"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/Logger/Level"
import * as HttpClient from "@effect/platform-node/HttpClient"
import { runMain } from "@effect/platform-node/Runtime"
import * as PodsHttp from "@effect/sharding-node/PodsHttp"
import * as ShardManagerHttp from "@effect/sharding-node/ShardManagerHttp"
import * as StorageFile from "@effect/sharding-node/StorageFile"
import * as ManagerConfig from "@effect/sharding/ManagerConfig"
import * as PodsHealth from "@effect/sharding/PodsHealth"
import * as ShardManager from "@effect/sharding/ShardManager"

const liveShardingManager = pipe(
  ShardManagerHttp.shardManagerHttp,
  Layer.use(ShardManager.live),
  Layer.use(StorageFile.storageFile),
  Layer.use(PodsHealth.local),
  Layer.use(PodsHttp.httpPods),
  Layer.use(ManagerConfig.defaults),
  Layer.use(HttpClient.client.layer)
)

Layer.launch(liveShardingManager).pipe(
  Logger.withMinimumLogLevel(LogLevel.All),
  Effect.tapErrorCause(Effect.logError),
  runMain
)
