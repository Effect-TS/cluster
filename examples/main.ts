import { pipe } from "@effect/data/Function"
import * as Cause from "@effect/io/Cause"
import * as Effect from "@effect/io/Effect"
import * as Logger from "@effect/io/Logger"
import * as Queue from "@effect/io/Queue"
import * as Ref from "@effect/io/Ref"
import * as Schema from "@effect/schema/Schema"
import * as Pods from "@effect/shardcake/Pods"
import * as RecipientType from "@effect/shardcake/RecipientType"
import * as Serialization from "@effect/shardcake/Serialization"
import * as Sharding from "@effect/shardcake/Sharding"
import * as ShardingConfig from "@effect/shardcake/ShardingConfig"
import * as ShardingImpl from "@effect/shardcake/ShardingImpl"
import * as ShardManagerClient from "@effect/shardcake/ShardManagerClient"
import * as Storage from "@effect/shardcake/Storage"

import * as LogLevel from "@effect/io/Logger/Level"
import * as Message from "@effect/shardcake/Message"

const [GetCurrent_] = Message.schema(Schema.number)(
  Schema.struct({
    _tag: Schema.literal("GetCurrent")
  })
)

const [GetUserById_, GetUserById] = Message.schema(
  Schema.struct({
    name: Schema.string,
    age: Schema.number
  })
)(
  Schema.struct({
    _tag: Schema.literal("GetUserById"),
    id: Schema.number
  })
)

const CounterMsg = Schema.union(
  Schema.struct({
    _tag: Schema.literal("Increment")
  }),
  Schema.struct({
    _tag: Schema.literal("Decrement")
  }),
  GetCurrent_,
  GetUserById_
)

type CounterMsg = Schema.To<typeof CounterMsg>

const CounterEntity = RecipientType.make("Counter", CounterMsg)

const program = pipe(
  Effect.flatMap(Sharding.Sharding, (sharding) =>
    pipe(
      sharding.registerEntity(CounterEntity, (counterId, dequeue) =>
        pipe(
          Ref.make(0),
          Effect.flatMap((count) =>
            pipe(
              Queue.take(dequeue),
              Effect.flatMap((msg) => {
                switch (msg._tag) {
                  case "Increment":
                    return Ref.update(count, (a) => a + 1)
                  case "Decrement":
                    return Ref.update(count, (a) => a - 1)
                  case "GetCurrent":
                    return pipe(
                      Ref.get(count),
                      Effect.flatMap((count) => msg.replier.reply(count))
                    )
                  case "GetUserById":
                    return msg.replier.reply({ name: "Mattia", age: 29 })
                }
              }),
              Effect.zipRight(Ref.get(count)),
              Effect.tap((_) => Effect.log("Counter " + counterId + " is now " + _)),
              Effect.forever
            )
          )
        )),
      Effect.zipRight(sharding.registerScoped),
      Effect.zipParRight(
        pipe(
          Effect.Do(),
          Effect.let("messenger", () => sharding.messenger(CounterEntity)),
          Effect.tap((_) => _.messenger.sendDiscard("entity1")({ _tag: "Increment" })),
          Effect.tap((_) => _.messenger.sendDiscard("entity1")({ _tag: "Increment" })),
          Effect.flatMap((_) => _.messenger.send("entity1")(GetUserById({ _tag: "GetUserById", id: 1 }))),
          Effect.tap((_) => Effect.log("User is " + _.name))
        )
      )
    )),
  Effect.zipRight(Effect.never()),
  Effect.scoped,
  Effect.provideSomeLayer(ShardingImpl.live),
  Effect.provideSomeLayer(Pods.noop),
  Effect.provideSomeLayer(Serialization.json),
  Effect.provideSomeLayer(ShardManagerClient.local),
  Effect.provideSomeLayer(Storage.memory),
  Effect.provideSomeLayer(ShardingConfig.defaults),
  Effect.catchAllCause((_) => Effect.log(Cause.pretty(_))),
  Logger.withMinimumLogLevel(LogLevel.All)
)

Effect.runFork(program)
