import * as Sharding from "./Sharding";
import * as Config from "./Config";
import * as Pods from "./Pods";
import * as Serialization from "./Serialization";
import * as Storage from "./Storage";
import * as ShardManagerClient from "./ShardManagerClient";
import * as Effect from "@effect/io/Effect";
import * as Queue from "@effect/io/Queue";
import * as Ref from "@effect/io/Ref";
import { pipe } from "@fp-ts/data/Function";
import { EntityType } from "./RecipientType";
import { runtimeDebug } from "@effect/io/Debug";
import * as Logger from "@effect/io/Logger";

import * as LogLevel from "@effect/io/Logger/Level";

runtimeDebug.minumumLogLevel = "All";

class Increment {
  readonly _tag = "Increment";
}

class Decrement {
  readonly _tag = "Decrement";
}

const CounterEntity = EntityType<Increment | Decrement>("Counter");

const program = pipe(
  Effect.serviceWithEffect(Sharding.Sharding)((sharding) =>
    pipe(
      sharding.registerEntity(CounterEntity, (counter, dequeue) =>
        pipe(
          Ref.make(0),
          Effect.flatMap((count) =>
            pipe(
              Queue.take(dequeue),
              Effect.map((msg) =>
                pipe(
                  count,
                  Ref.update((_) => _ + (msg._tag === "Decrement" ? -1 : 1))
                )
              ),
              Effect.zipRight(Ref.get(count)),
              Effect.tap((_) => Effect.sync(() => console.log("Counter ", counter, " is now ", _))),
              Effect.forever
            )
          )
        )
      ),
      Effect.zipRight(sharding.registerScoped),
      Effect.zipRight(
        pipe(
          Effect.Do(),
          Effect.bindValue("messenger", () => sharding.messenger(CounterEntity)),
          Effect.tap((_) => _.messenger.send("1")((_) => new Increment()))
        )
      )
    )
  ),
  Effect.zipLeft(Effect.never()),
  Effect.scoped,
  Effect.provideSomeLayer(Sharding.live),
  Effect.provideSomeLayer(Pods.noop),
  Effect.provideSomeLayer(Serialization.noop),
  Effect.provideSomeLayer(ShardManagerClient.local),
  Effect.provideSomeLayer(Storage.memory),
  Effect.provideSomeLayer(Config.defaults),
  Effect.catchAllCause((_) => Effect.sync(() => console.log("failed with cause", _))),
  Logger.withMinimumLogLevel(LogLevel.All)
);

Effect.unsafeFork(program);
