import * as NodeClient from "@effect/platform-node/Http/NodeClient"
import * as PodsHttp from "@effect/sharding-node/PodsHttp"
import * as ShardManagerClientHttp from "@effect/sharding-node/ShardManagerClientHttp"
import * as StorageFile from "@effect/sharding-node/StorageFile"
import * as Serialization from "@effect/sharding/Serialization"
import * as Sharding from "@effect/sharding/Sharding"
import * as ShardingConfig from "@effect/sharding/ShardingConfig"
import * as ShardingImpl from "@effect/sharding/ShardingImpl"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"
import * as Stream from "effect/Stream"
import { CounterEntity, GetCurrent, SubscribeChanges } from "./sample-common"

const liveSharding = pipe(
  ShardingImpl.live,
  Layer.use(StorageFile.storageFile),
  Layer.use(PodsHttp.httpPods),
  Layer.use(ShardManagerClientHttp.shardManagerClientHttp),
  Layer.use(ShardingConfig.withDefaults({ shardingPort: 54322 })),
  Layer.use(Serialization.json),
  Layer.use(NodeClient.layer)
)

const program = pipe(
  Effect.Do,
  Effect.bind("messenger", () => Sharding.messenger(CounterEntity)),
  Effect.bind("changes", (_) => _.messenger.sendStream("entity1")(SubscribeChanges({ _tag: "SubscribeChanges" }))),
  Effect.tap((_) =>
    pipe(
      _.changes,
      Stream.mapEffect((_) => Effect.logInfo("SubscribeChanges: " + _)),
      Stream.runDrain,
      Effect.catchAllCause(Effect.logInfo),
      Logger.withMinimumLogLevel(LogLevel.All),
      Effect.forkDaemon
    )
  ),
  Effect.tap((_) => _.messenger.sendDiscard("entity1")({ _tag: "Increment" })),
  Effect.tap((_) => _.messenger.sendDiscard("entity1")({ _tag: "Increment" })),
  Effect.flatMap((_) => _.messenger.send("entity1")(GetCurrent({ _tag: "GetCurrent" }))),
  Effect.tap((_) => Effect.log("Current count is " + _)),
  Effect.zipRight(Effect.never),
  Effect.scoped,
  Effect.catchAllCause(Effect.logError),
  Logger.withMinimumLogLevel(LogLevel.All),
  Effect.provide(liveSharding)
)

Effect.runFork(program)
