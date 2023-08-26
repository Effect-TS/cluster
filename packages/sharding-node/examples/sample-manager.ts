import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import * as Logger from "@effect/io/Logger"
import * as LogLevel from "@effect/io/Logger/Level"
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
  Layer.use(ManagerConfig.defaults)
)

Layer.launch(liveShardingManager).pipe(
  Logger.withMinimumLogLevel(LogLevel.All),
  Effect.tapErrorCause(Effect.logError),
  runMain
)
