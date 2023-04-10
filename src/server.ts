import * as Sharding from "./Sharding";
import * as Config from "./Config";
import * as Pods from "./Pods";
import * as Serialization from "./Serialization";
import * as StorageFile from "./StorageFile";
import * as ShardManager from "./ShardManager";
import * as ManagerConfig from "./ManagerConfig";
import * as Effect from "@effect/io/Effect";
import * as Deferred from "@effect/io/Deferred";
import * as PodsHealth from "./PodsHealth";
import * as Cause from "@effect/io/Cause";
import * as Ref from "@effect/io/Ref";
import { EntityType } from "./RecipientType";
import * as Logger from "@effect/io/Logger";
import { pipe } from "@effect/data/Function";

import * as LogLevel from "@effect/io/Logger/Level";
import * as ShardManagerExpress from "./ShardManagerHttp";

const program = pipe(
  Effect.never(),
  ShardManagerExpress.shardManagerHttp,
  Effect.catchAllCause((_) => Effect.log(Cause.pretty(_))),
  Logger.withMinimumLogLevel(LogLevel.All),
  Effect.provideSomeLayer(ShardManager.live),
  Effect.provideSomeLayer(StorageFile.storageFile),
  Effect.provideSomeLayer(PodsHealth.local),
  Effect.provideService(ManagerConfig.ManagerConfig, ManagerConfig.defaults)
);

Effect.runFork(program);
