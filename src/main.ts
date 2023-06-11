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
import { EntityType } from "./RecipientType";
import * as Logger from "@effect/io/Logger";
import { pipe } from "@effect/data/Function";
import * as Schema from "@effect/schema/Schema";
import * as HashMap from "@effect/data/HashMap";

import * as LogLevel from "@effect/io/Logger/Level";
import * as Replier from "./Replier";
import * as Message from "./Message";

const [GetCurrent_, GetCurrent] = Message.schema(Schema.number)(
  Schema.struct({
    _tag: Schema.literal("GetCurrent"),
  })
);

const CounterMsg = Schema.union(
  Schema.struct({
    _tag: Schema.literal("Increment"),
  }),
  Schema.struct({
    _tag: Schema.literal("Decrement"),
  }),
  GetCurrent_
);

type CounterMsg = Schema.To<typeof CounterMsg>;

const CounterEntity = EntityType("Counter", CounterMsg);

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
      Effect.zipRight(sharding.registerScoped),
      Effect.zipParRight(
        pipe(
          Effect.Do(),
          Effect.let("messenger", () => sharding.messenger(CounterEntity)),
          Effect.tap((_) => _.messenger.sendDiscard("entity1")({ _tag: "Increment" })),
          Effect.tap((_) => _.messenger.sendDiscard("entity1")({ _tag: "Increment" })),
          Effect.flatMap((_) =>
            _.messenger.send("entity1")(
              GetCurrent({
                _tag: "GetCurrent",
              })
            )
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
  Effect.provideSomeLayer(Serialization.json),
  Effect.provideSomeLayer(ShardManagerClient.local),
  Effect.provideSomeLayer(Storage.memory),
  Effect.provideSomeLayer(Config.defaults),
  Effect.catchAllCause((_) => Effect.log(Cause.pretty(_))),
  Logger.withMinimumLogLevel(LogLevel.All)
);

Effect.runFork(program);
