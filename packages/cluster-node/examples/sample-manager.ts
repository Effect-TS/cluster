import * as PodsRpc from "@effect/cluster-node/PodsRpc"
import type * as ShardingServiceRpc from "@effect/cluster-node/ShardingServiceRpc"
import * as ShardManagerHttp from "@effect/cluster-node/ShardManagerHttp"
import * as StorageFile from "@effect/cluster-node/StorageFile"
import * as ManagerConfig from "@effect/cluster/ManagerConfig"
import * as PodsHealth from "@effect/cluster/PodsHealth"
import * as ShardManager from "@effect/cluster/ShardManager"
import { runMain } from "@effect/platform-node/NodeRuntime"
import * as HttpClient from "@effect/platform/HttpClient"
import { Resolver } from "@effect/rpc"
import { HttpResolver } from "@effect/rpc-http"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"

const liveShardingManager = pipe(
  ShardManagerHttp.shardManagerHttp,
  Layer.provide(ShardManager.live),
  Layer.provide(StorageFile.storageFile),
  Layer.provide(PodsHealth.local),
  Layer.provide(PodsRpc.podsRpc<never>((podAddress) =>
    HttpResolver.make<ShardingServiceRpc.ShardingServiceRpc>(
      HttpClient.client.fetchOk.pipe(
        HttpClient.client.mapRequest(
          HttpClient.request.prependUrl(`http://${podAddress.host}:${podAddress.port}/api/rest`)
        )
      )
    ).pipe(Resolver.toClient) as any // TODO: ask tim about better typings
  )),
  Layer.provide(ManagerConfig.fromConfig),
  Layer.provide(HttpClient.client.layer)
)

Layer.launch(liveShardingManager).pipe(
  Logger.withMinimumLogLevel(LogLevel.All),
  Effect.tapErrorCause(Effect.logError),
  runMain
)
