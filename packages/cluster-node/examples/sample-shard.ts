import * as PodsHttp from "@effect/cluster-node/PodsHttp"
import * as ShardingServiceHttp from "@effect/cluster-node/ShardingServiceHttp"
import * as ShardManagerClientHttp from "@effect/cluster-node/ShardManagerClientHttp"
import * as StorageFile from "@effect/cluster-node/StorageFile"
import * as PoisonPill from "@effect/cluster/PoisonPill"
import * as RecipientBehaviour from "@effect/cluster/RecipientBehaviour"
import * as Serialization from "@effect/cluster/Serialization"
import * as Sharding from "@effect/cluster/Sharding"
import * as ShardingConfig from "@effect/cluster/ShardingConfig"
import * as NodeClient from "@effect/platform-node/Http/NodeClient"
import { runMain } from "@effect/platform-node/Runtime"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as Layer from "effect/Layer"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"
import * as Ref from "effect/Ref"
import * as SubscriptionRef from "effect/SubscriptionRef"
import { CounterEntity } from "./sample-common.js"

const liveSharding = pipe(
  Sharding.live,
  Layer.use(StorageFile.storageFile),
  Layer.use(PodsHttp.httpPods),
  Layer.use(ShardManagerClientHttp.shardManagerClientHttp),
  Layer.use(Serialization.json),
  Layer.use(NodeClient.layer)
)

const programLayer = Layer.scopedDiscard(pipe(
  Sharding.registerEntity(
    CounterEntity,
    RecipientBehaviour.fromInMemoryQueue((entityId, dequeue) =>
      pipe(
        SubscriptionRef.make(0),
        Effect.flatMap((count) =>
          pipe(
            PoisonPill.takeOrInterrupt(dequeue),
            Effect.flatMap(
              (msg) => {
                switch (msg._tag) {
                  case "Increment":
                    return SubscriptionRef.update(count, (a) => a + 1)
                  case "Decrement":
                    return SubscriptionRef.update(count, (a) => a - 1)
                  case "GetCurrent":
                    return pipe(
                      SubscriptionRef.get(count),
                      Effect.flatMap(msg.replier.reply)
                    )
                }
              }
            ),
            Effect.zipRight(Ref.get(count)),
            Effect.tap((_) => Effect.log("Counter " + entityId + " is now " + _)),
            Effect.forever,
            Effect.withLogSpan(CounterEntity.name + "." + entityId)
          )
        )
      )
    )
  ),
  Effect.zipRight(Sharding.registerScoped)
))

const liveLayer = pipe(
  programLayer,
  Layer.merge(ShardingServiceHttp.shardingServiceHttp),
  Layer.use(liveSharding),
  Layer.use(ShardingConfig.defaults)
)

Layer.launch(liveLayer).pipe(
  Logger.withMinimumLogLevel(LogLevel.All),
  Effect.tapErrorCause(Effect.logError),
  runMain
)
