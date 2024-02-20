import * as PodsHttp from "@effect/cluster-node/PodsHttp"
import * as ShardManagerClientHttp from "@effect/cluster-node/ShardManagerClientHttp"
import * as StorageFile from "@effect/cluster-node/StorageFile"
import * as Serialization from "@effect/cluster/Serialization"
import * as Sharding from "@effect/cluster/Sharding"
import * as ShardingConfig from "@effect/cluster/ShardingConfig"
import * as NodeClient from "@effect/platform-node/NodeHttpClient"
import { runMain } from "@effect/platform-node/NodeRuntime"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"
import * as Ref from "effect/Ref"
import { CounterEntity, GetCurrent, Increment } from "./sample-common.js"

const liveLayer = Effect.gen(function*(_) {
  const messenger = yield* _(Sharding.messenger(CounterEntity))
  const idRef = yield* _(Ref.make(0))

  while (true) {
    const id = yield* _(Ref.getAndUpdate(idRef, (_) => _ + 1))
    const entityId = `entity-${id % 10}`

    yield* _(messenger.sendDiscard(entityId)(new Increment({ messageId: `increment-${id}` })))
    const result = yield* _(messenger.send(entityId)(new GetCurrent({ messageId: `get-count-${id}` })))
    yield* _(Effect.logInfo(`Counter ${entityId} is now: ${result}`))

    yield* _(Effect.sleep(200))
  }
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
