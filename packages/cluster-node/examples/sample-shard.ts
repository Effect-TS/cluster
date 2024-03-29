import * as PodsHttp from "@effect/cluster-node/PodsHttp"
import * as ShardingServiceHttp from "@effect/cluster-node/ShardingServiceHttp"
import * as ShardManagerClientHttp from "@effect/cluster-node/ShardManagerClientHttp"
import * as StorageFile from "@effect/cluster-node/StorageFile"
import * as MessageState from "@effect/cluster/MessageState"
import * as RecipientBehaviour from "@effect/cluster/RecipientBehaviour"
import * as Serialization from "@effect/cluster/Serialization"
import * as Sharding from "@effect/cluster/Sharding"
import * as ShardingConfig from "@effect/cluster/ShardingConfig"
import * as NodeClient from "@effect/platform-node/NodeHttpClient"
import { runMain } from "@effect/platform-node/NodeRuntime"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"
import * as Option from "effect/Option"
import * as Ref from "effect/Ref"
import { CounterEntity } from "./sample-common.js"

const liveLayer = Sharding.registerEntity(
  CounterEntity
)(
  RecipientBehaviour.fromFunctionEffectStateful(
    () => Effect.succeed(0),
    (entityId, message, stateRef) => {
      switch (message._tag) {
        case "Increment":
          return pipe(
            Ref.update(stateRef, (count) => count + 1),
            Effect.zipLeft(Effect.logInfo(`Counter ${entityId} incremented`)),
            Effect.as(MessageState.Processed(Option.none()))
          )
        case "Decrement":
          return pipe(
            Ref.update(stateRef, (count) => count - 1),
            Effect.zipLeft(Effect.logInfo(`Counter ${entityId} decremented`)),
            Effect.as(MessageState.Processed(Option.none()))
          )
        case "GetCurrent":
          return pipe(
            Ref.get(stateRef),
            Effect.exit,
            Effect.map((result) => MessageState.Processed(Option.some(result)))
          )
      }
    }
  )
).pipe(
  Effect.zipRight(Sharding.registerScoped),
  Layer.scopedDiscard,
  Layer.provide(ShardingServiceHttp.shardingServiceHttp),
  Layer.provideMerge(Sharding.live),
  Layer.provide(StorageFile.storageFile),
  Layer.provide(PodsHttp.httpPods),
  Layer.provide(ShardManagerClientHttp.shardManagerClientHttp),
  Layer.provide(Serialization.json),
  Layer.provide(NodeClient.layer),
  Layer.provide(ShardingConfig.fromConfig)
)

Layer.launch(liveLayer).pipe(
  Logger.withMinimumLogLevel(LogLevel.Debug),
  Effect.tapErrorCause(Effect.logError),
  runMain
)
