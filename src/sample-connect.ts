import * as Sharding from "./Sharding";
import * as Config from "./Config";
import * as PodsHttp from "./PodsHttp";
import * as Serialization from "./Serialization";
import * as StorageFile from "./StorageFile";
import * as ShardManagerClientHttp from "./ShardManagerClientHttp";
import * as Effect from "@effect/io/Effect";
import * as Cause from "@effect/io/Cause";
import * as Logger from "@effect/io/Logger";
import { pipe } from "@effect/data/Function";

import * as LogLevel from "@effect/io/Logger/Level";
import { CounterEntity, GetCurrent } from "./sample-common";

const program = pipe(
  Effect.flatMap(Sharding.Sharding, (sharding) =>
    pipe(
      Effect.Do(),
      Effect.let("messenger", () => sharding.messenger(CounterEntity)),
      Effect.tap((_) => _.messenger.sendDiscard("entity1")({ _tag: "Increment" })),
      Effect.tap((_) => _.messenger.sendDiscard("entity1")({ _tag: "Increment" })),
      Effect.flatMap((_) => _.messenger.send("entity1")(GetCurrent({ _tag: "GetCurrent" }))),
      Effect.tap((_) => Effect.log("Current count is " + _))
    )
  ),
  Effect.zipRight(Effect.never()),
  Effect.scoped,
  Effect.provideSomeLayer(Sharding.live),
  Effect.provideSomeLayer(StorageFile.storageFile),
  Effect.provideSomeLayer(PodsHttp.httpPods),
  Effect.provideSomeLayer(ShardManagerClientHttp.shardManagerClientHttp),
  Effect.provideSomeLayer(Config.defaults),
  Effect.provideSomeLayer(Serialization.json),
  Effect.catchAllCause((_) => Effect.log(Cause.pretty(_))),
  Logger.withMinimumLogLevel(LogLevel.All)
);

Effect.runFork(program);
