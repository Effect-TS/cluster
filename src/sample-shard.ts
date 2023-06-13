import * as Sharding from "./Sharding";
import * as Config from "./Config";
import * as PodsHttp from "./PodsHttp";
import * as Serialization from "./Serialization";
import * as StorageFile from "./StorageFile";
import * as ShardManagerClientHttp from "./ShardManagerClientHttp";
import * as ShardingServiceHttp from "./ShardingServiceHttp";
import * as Effect from "@effect/io/Effect";
import * as Deferred from "@effect/io/Deferred";
import * as Queue from "@effect/io/Queue";
import * as Cause from "@effect/io/Cause";
import * as Ref from "@effect/io/Ref";
import { EntityType } from "./RecipientType";
import * as Logger from "@effect/io/Logger";
import { pipe } from "@effect/data/Function";
import * as Schema from "@effect/schema/Schema";
import * as Message from "./Message";

import * as LogLevel from "@effect/io/Logger/Level";
import * as Replier from "./Replier";
import { CounterEntity } from "./sample-common";

const program = pipe(
  Effect.flatMap(Sharding.Sharding, (sharding) =>
    pipe(
      sharding.registerEntity(CounterEntity, (counterId, dequeue) =>
        pipe(
          Ref.make(0),
          Effect.flatMap((count) =>
            pipe(
              Queue.take(dequeue),
              Effect.flatMap(
                (msg) =>
                  ({
                    Increment: Ref.update(count, (a) => a + 1),
                    Decrement: Ref.update(count, (a) => a - 1),
                    GetCurrent: pipe(
                      Ref.get(count),
                      Effect.flatMap((_) =>
                        msg._tag === "GetCurrent" ? msg.replier.reply(_) : Effect.unit()
                      )
                    ),
                  }[msg._tag])
              ),
              Effect.zipRight(Ref.get(count)),
              Effect.tap((_) => Effect.log("Counter " + counterId + " is now " + _)),
              Effect.forever
            )
          )
        )
      ),
      Effect.zipRight(sharding.registerScoped)
    )
  ),
  Effect.zipRight(Effect.never()),
  ShardingServiceHttp.shardingServiceHttp,
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
