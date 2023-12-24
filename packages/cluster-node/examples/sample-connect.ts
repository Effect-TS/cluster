import * as PodsHttp from "@effect/cluster-node/PodsHttp"
import * as ShardManagerClientHttp from "@effect/cluster-node/ShardManagerClientHttp"
import * as StorageFile from "@effect/cluster-node/StorageFile"
import * as Serialization from "@effect/cluster/Serialization"
import * as Sharding from "@effect/cluster/Sharding"
import * as ShardingConfig from "@effect/cluster/ShardingConfig"
import * as NodeClient from "@effect/platform-node/Http/NodeClient"
import { runMain } from "@effect/platform-node/Runtime"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"
import { CounterEntity, GetCurrent } from "./sample-common.js"

const liveLayer = Effect.gen(function*(_) {
  const messenger = yield* _(Sharding.messenger(CounterEntity))

  yield* _(messenger.unsafeSendDiscard("entity1")({ _tag: "Increment" }))
  yield* _(messenger.unsafeSendDiscard("entity1")({ _tag: "Increment" }))

  const message = yield* _(GetCurrent.makeEffect({ _tag: "GetCurrent" }))
  const result = yield* _(messenger.send("entity1")(message))

  yield* _(Effect.logInfo("Current count is " + result))
}).pipe(
  Layer.effectDiscard,
  Layer.provide(Sharding.live),
  Layer.provide(StorageFile.storageFile),
  Layer.provide(PodsHttp.httpPods),
  Layer.provide(ShardManagerClientHttp.shardManagerClientHttp),
  Layer.provide(ShardingConfig.withDefaults({ shardingPort: 54322 })),
  Layer.provide(Serialization.json),
  Layer.provide(NodeClient.layer)
)

Layer.launch(liveLayer).pipe(
  Logger.withMinimumLogLevel(LogLevel.All),
  Effect.tapErrorCause(Effect.logError),
  runMain
)
