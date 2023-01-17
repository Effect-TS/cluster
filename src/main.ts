import * as Sharding from "./Sharding";
import * as Config from "./Config";
import * as Pods from "./Pods";
import * as Serialization from "./Serialization";
import * as Storage from "./Storage";
import * as ShardManagerClient from "./ShardManagerClient";
import * as Effect from "@effect/io/Effect";
import * as Deferred from "@effect/io/Deferred";
import * as Queue from "@effect/io/Queue";
import * as Cause from "@effect/io/Cause";
import * as Ref from "@effect/io/Ref";
import { pipe } from "@fp-ts/data/Function";
import { EntityType } from "./RecipientType";
import { runtimeDebug } from "@effect/io/Debug";
import * as Logger from "@effect/io/Logger";

import * as LogLevel from "@effect/io/Logger/Level";
import { Replier } from "./Replier";

class Increment {
  readonly _tag = "Increment";
}

class Decrement {
  readonly _tag = "Decrement";
}

class GetCurrent {
  readonly _tag = "GetCurrent";
  constructor(readonly replier: Replier<number>) {}
}

const CounterEntity = EntityType<Increment | Decrement | GetCurrent>("Counter");

const program = pipe(
  Effect.serviceWithEffect(Sharding.Sharding)((sharding) =>
    pipe(
      sharding.registerEntity(CounterEntity, (counter, dequeue) =>
        pipe(
          Ref.make(0),
          Effect.flatMap((count) =>
            pipe(
              Queue.take(dequeue),
              Effect.flatMap(
                (msg) =>
                  ({
                    Increment: pipe(
                      count,
                      Ref.update((a) => a + 1)
                    ),
                    Decrement: pipe(
                      count,
                      Ref.update((a) => a + 1)
                    ),
                    GetCurrent: pipe(
                      Ref.get(count),
                      Effect.flatMap((_) =>
                        msg._tag === "GetCurrent" ? msg.replier.reply(_) : Effect.unit()
                      )
                    ),
                  }[msg._tag])
              ),
              Effect.zipRight(Ref.get(count)),
              Effect.tap((_) => Effect.log("Counter " + counter + " is now " + _)),
              Effect.forever
            )
          )
        )
      ),
      Effect.zipRight(sharding.registerScoped),
      Effect.zipParRight(
        pipe(
          Effect.Do(),
          Effect.bindValue("messenger", () => sharding.messenger(CounterEntity)),
          Effect.tap((_) => _.messenger.sendDiscard("test1")(new Increment())),
          Effect.tap((_) => _.messenger.sendDiscard("test1")(new Increment())),
          Effect.flatMap((_) =>
            _.messenger.send("test1")((_: Replier<number>) => new GetCurrent(_))
          ),
          Effect.tap((_) => Effect.log("Result is now " + _))
        )
      )
    )
  ),
  Effect.zipRight(Effect.never()),
  Effect.scoped,
  Effect.provideSomeLayer(Sharding.live),
  Effect.provideSomeLayer(Pods.noop),
  Effect.provideSomeLayer(Serialization.noop),
  Effect.provideSomeLayer(ShardManagerClient.local),
  Effect.provideSomeLayer(Storage.memory),
  Effect.provideSomeLayer(Config.defaults),
  Effect.catchAllCause((_) => Effect.log(Cause.pretty()(_))),
  Logger.withMinimumLogLevel(LogLevel.All)
);

Effect.unsafeFork(program);
