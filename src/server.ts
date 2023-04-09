import * as Sharding from "./Sharding";
import * as Config from "./Config";
import * as Pods from "./Pods";
import * as Serialization from "./Serialization";
import * as StorageFile from "./StorageFile";
import * as ShardManager from "./ShardManager";
import * as Effect from "@effect/io/Effect";
import * as Deferred from "@effect/io/Deferred";
import * as PodsHealth from "./PodsHealth";
import * as Cause from "@effect/io/Cause";
import * as Pod from "./Pod";
import * as PodAddress from "./PodAddress";
import * as Ref from "@effect/io/Ref";
import { EntityType } from "./RecipientType";
import * as Logger from "@effect/io/Logger";
import { pipe } from "@effect/data/Function";
import * as Schema from "@effect/schema/Schema";

import * as LogLevel from "@effect/io/Logger/Level";
import * as ShardManagerExpress from "./ShardManagerExpress";

const RequestSchema = Schema.union(
  Schema.struct({
    _tag: Schema.literal("Register"),
    pod: Pod.Schema_,
  }),
  Schema.struct({
    _tag: Schema.literal("Unregister"),
    pod: Pod.Schema_,
  }),
  Schema.struct({
    _tag: Schema.literal("NotifyUnhealthyPod"),
    podAddress: PodAddress.Schema_,
  }),
  Schema.struct({
    _tag: Schema.literal("CheckAllPodsHealth"),
  })
);

const program = pipe(
  ShardManager.ShardManager,
  Effect.flatMap((shardManager) =>
    ShardManagerExpress.asHttpServer((data: string) =>
      pipe(
        Effect.sync(() => JSON.parse(data)),
        Effect.flatMap(Schema.decodeEffect(RequestSchema)),
        Effect.flatMap((req) => {
          switch (req._tag) {
            case "Register":
              return Effect.zipRight(shardManager.register(req.pod), Effect.succeed("true"));
            case "Unregister":
              return Effect.zipRight(
                shardManager.unregister(req.pod.address),
                Effect.succeed("true")
              );
            case "NotifyUnhealthyPod":
              return Effect.zipRight(
                shardManager.notifyUnhealthyPod(req.podAddress),
                Effect.succeed("true")
              );
            case "CheckAllPodsHealth":
              return Effect.zipRight(shardManager.checkAllPodsHealth, Effect.succeed("true"));
          }
        }),
        Effect.catchAllCause((_) => Effect.succeed(JSON.stringify(_)))
      )
    )
  ),
  Effect.catchAllCause((_) => Effect.log(Cause.pretty(_))),
  Logger.withMinimumLogLevel(LogLevel.All),
  Effect.provideSomeLayer(ShardManager.live),
  Effect.provideSomeLayer(StorageFile.storageFile),
  Effect.provideSomeLayer(PodsHealth.local)
);

Effect.runFork(program);
