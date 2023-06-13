import * as StorageFile from "./StorageFile";
import * as ShardManager from "./ShardManager";
import * as ManagerConfig from "./ManagerConfig";
import * as Effect from "@effect/io/Effect";
import * as PodsHealth from "./PodsHealth";
import * as PodsHttp from "./PodsHttp";
import * as Cause from "@effect/io/Cause";
import * as Logger from "@effect/io/Logger";
import { pipe } from "@effect/data/Function";

import * as LogLevel from "@effect/io/Logger/Level";
import * as ShardManagerHttp from "./ShardManagerHttp";

const program = pipe(
  Effect.never(),
  ShardManagerHttp.shardManagerHttp,
  Effect.provideSomeLayer(ShardManager.live),
  Effect.provideSomeLayer(StorageFile.storageFile),
  Effect.provideSomeLayer(PodsHealth.local),
  Effect.provideSomeLayer(PodsHttp.httpPods),
  Effect.provideService(ManagerConfig.ManagerConfig, ManagerConfig.defaults),
  Effect.catchAllCause((_) => Effect.log(Cause.pretty(_))),
  Logger.withMinimumLogLevel(LogLevel.All)
);

Effect.runFork(program);
