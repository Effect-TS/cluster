import * as PodsHttp from "@effect/cluster-node/PodsHttp"
import * as ShardManagerHttp from "@effect/cluster-node/ShardManagerHttp"
import * as StorageFile from "@effect/cluster-node/StorageFile"
import * as ManagerConfig from "@effect/cluster/ManagerConfig"
import * as PodsHealth from "@effect/cluster/PodsHealth"
import * as ShardManager from "@effect/cluster/ShardManager"
import * as HttpClient from "@effect/platform-node/HttpClient"
import { runMain } from "@effect/platform-node/Runtime"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"

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
