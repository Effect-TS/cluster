import * as Message from "@effect/cluster/Message"
import type * as MessageQueue from "@effect/cluster/MessageQueue"
import * as Pods from "@effect/cluster/Pods"
import * as PodsHealth from "@effect/cluster/PodsHealth"
import * as PoisonPill from "@effect/cluster/PoisonPill"
import * as RecipientType from "@effect/cluster/RecipientType"
import * as Serialization from "@effect/cluster/Serialization"
import * as Sharding from "@effect/cluster/Sharding"
import * as ShardingConfig from "@effect/cluster/ShardingConfig"
import * as ShardingError from "@effect/cluster/ShardingError"
import * as ShardingImpl from "@effect/cluster/ShardingImpl"
import * as ShardManagerClient from "@effect/cluster/ShardManagerClient"
import * as Storage from "@effect/cluster/Storage"
import { assertFalse, assertTrue } from "@effect/cluster/test/util"
import * as Schema from "@effect/schema/Schema"
import * as Cause from "effect/Cause"
import * as Chunk from "effect/Chunk"
import { Tag } from "effect/Context"
import * as Deferred from "effect/Deferred"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import { equals } from "effect/Equal"
import * as Exit from "effect/Exit"
import { pipe } from "effect/Function"
import * as HashMap from "effect/HashMap"
import * as Layer from "effect/Layer"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"
import * as Option from "effect/Option"
import * as Queue from "effect/Queue"
import * as Ref from "effect/Ref"
import * as Stream from "effect/Stream"

interface SampleService {
  value: number
}

const SampleService = Tag<SampleService>()

describe.concurrent("SampleTests", () => {
  const inMemorySharding = pipe(
    ShardingImpl.live,
    Layer.use(PodsHealth.local),
    Layer.use(Pods.noop),
    Layer.use(Storage.memory),
    Layer.use(Serialization.json),
    Layer.use(ShardManagerClient.local),
    Layer.use(
      ShardingConfig.withDefaults({
        simulateRemotePods: true,
        entityTerminationTimeout: Duration.millis(3000),
        sendTimeout: Duration.millis(1000)
      })
    )
  )

  const withTestEnv = <R, E, A>(fa: Effect.Effect<R, E, A>) =>
    pipe(fa, Effect.provide(inMemorySharding), Effect.scoped, Logger.withMinimumLogLevel(LogLevel.Error))

  it("Succefully delivers a message", () => {
    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)
      const received = yield* _(Ref.make(false))

      const SampleEntity = RecipientType.makeEntityType("Sample", Schema.number)

      yield* _(
        Sharding.registerEntity(
          SampleEntity,
          (recipientContext) =>
            pipe(PoisonPill.takeOrInterrupt(recipientContext.dequeue), Effect.zipRight(Ref.set(received, true)))
        )
      )

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      yield* _(messenger.sendDiscard("entity1")(1))

      assertTrue(yield* _(Ref.get(received)))
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Fails with if entity not registered", () => {
    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)
      const SampleEntity = RecipientType.makeEntityType("Sample", Schema.number)

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      const exit = yield* _(messenger.sendDiscard("entity1")(1).pipe(Effect.exit))

      assertTrue(Exit.isFailure(exit))

      if (Exit.isFailure(exit)) {
        const error = Cause.failureOption(exit.cause)
        assertTrue(Option.isSome(error))
        if (Option.isSome(error)) {
          assertTrue(ShardingError.isShardingErrorEntityTypeNotRegistered(error.value))
        }
      }
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Succefully delivers a message to the correct entity", () => {
    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)
      const result1 = yield* _(Ref.make(0))
      const result2 = yield* _(Ref.make(0))

      const SampleEntity = RecipientType.makeEntityType("Sample", Schema.number)

      yield* _(Sharding.registerEntity(SampleEntity, (recipientContext) =>
        pipe(
          PoisonPill.takeOrInterrupt(recipientContext.dequeue),
          Effect.flatMap((msg) => Ref.set(recipientContext.entityId === "entity1" ? result1 : result2, msg))
        )))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      yield* _(messenger.sendDiscard("entity1")(1))
      yield* _(messenger.sendDiscard("entity2")(2))

      assertTrue(1 === (yield* _(Ref.get(result1))))
      assertTrue(2 === (yield* _(Ref.get(result2))))
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Succefully delivers a message with a reply to an entity", () => {
    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)
      const SampleMessage = Message.schema(Schema.number)(Schema.struct({
        _tag: Schema.literal("SampleMessage")
      }))

      const SampleProtocol = Schema.union(SampleMessage)

      const SampleEntity = RecipientType.makeEntityType("Sample", SampleProtocol)

      yield* _(Sharding.registerEntity(SampleEntity, (recipientContext) =>
        pipe(
          PoisonPill.takeOrInterrupt(recipientContext.dequeue),
          Effect.flatMap((msg) => recipientContext.reply(msg, 42))
        )))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      const msg = yield* _(SampleMessage.makeEffect({ _tag: "SampleMessage" }))
      const result = yield* _(messenger.send("entity1")(msg))

      assertTrue(result === 42)
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Succefully broadcasts a message", () => {
    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)
      const GetIncrement = Message.schema(Schema.number)(Schema.struct({
        _tag: Schema.literal("GetIncrement")
      }))

      const SampleProtocol = Schema.union(
        Schema.struct({
          _tag: Schema.literal("BroadcastIncrement")
        }),
        GetIncrement
      )

      const SampleTopic = RecipientType.makeTopicType("Sample", SampleProtocol)

      yield* _(Sharding.registerTopic(SampleTopic, (recipientContext) =>
        Effect.flatMap(Ref.make(0), (ref) =>
          pipe(
            PoisonPill.takeOrInterrupt(recipientContext.dequeue),
            Effect.flatMap((msg) => {
              switch (msg._tag) {
                case "BroadcastIncrement":
                  return Ref.update(ref, (_) => _ + 1)
                case "GetIncrement":
                  return Effect.flatMap(Ref.get(ref), (_) => recipientContext.reply(msg, _))
              }
            }),
            Effect.forever
          ))))

      const broadcaster = yield* _(Sharding.broadcaster(SampleTopic))
      yield* _(broadcaster.broadcastDiscard("c1")({ _tag: "BroadcastIncrement" }))
      yield* _(Effect.sleep(Duration.seconds(2)))

      const msg = yield* _(GetIncrement.makeEffect({ _tag: "GetIncrement" }))
      const c1 = yield* _(broadcaster.broadcast("c1")(msg))

      assertTrue(1 === HashMap.size(c1)) // Here we have just one pod, so there will be just one incrementer
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Succefully delivers a message with a streaming reply to an entity", () => {
    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)
      const SampleMessage = Message.schema(Schema.number)(Schema.struct({
        _tag: Schema.literal("SampleMessage")
      }))

      const SampleProtocol = Schema.union(SampleMessage)

      const SampleEntity = RecipientType.makeEntityType("Sample", SampleProtocol)

      yield* _(Sharding.registerEntity(SampleEntity, ({ dequeue, replyStream }) =>
        pipe(
          PoisonPill.takeOrInterrupt(dequeue),
          Effect.flatMap((msg) => replyStream(msg, Stream.fromIterable([1, 2, 3]))),
          Effect.forever
        )))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      const msg = yield* _(SampleMessage.makeEffect({ _tag: "SampleMessage" }))
      const stream = yield* _(messenger.sendStream("entity1")(msg))
      const result = yield* _(Stream.runCollect(stream))

      assertTrue(equals(result, Chunk.fromIterable([1, 2, 3])))
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("When the messenger interrupts, the stream on the entity should too", () => {
    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)
      const exit = yield* _(Deferred.make<never, boolean>())
      const SampleMessage = Message.schema(Schema.number)(Schema.struct({
        _tag: Schema.literal("SampleMessage")
      }))

      const SampleProtocol = Schema.union(
        SampleMessage
      )

      const SampleEntity = RecipientType.makeEntityType("Sample", SampleProtocol)

      yield* _(Sharding.registerEntity(SampleEntity, ({ dequeue, replyStream }) =>
        pipe(
          PoisonPill.takeOrInterrupt(dequeue),
          Effect.flatMap((msg) =>
            replyStream(
              msg,
              pipe(
                Stream.never,
                Stream.ensuring(Deferred.succeed(exit, true)), // <- signal interruption on shard side
                Stream.map(() => 42)
              )
            )
          ),
          Effect.forever
        )))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      const msg = yield* _(SampleMessage.makeEffect({ _tag: "SampleMessage" }))
      const stream = yield* _(messenger.sendStream("entity1")(msg))
      yield* _(
        Stream.runDrain(stream.pipe(
          Stream.interruptAfter(Duration.millis(500)) // <- interrupts after a while
        ))
      )

      yield* _(Deferred.await(exit)) // <- hangs if not working
      assertTrue(true)
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("When the stream on entity interrupts, the stream on the messenger should close", () => {
    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)
      const exit = yield* _(Deferred.make<never, boolean>())
      const SampleMessage = Message.schema(Schema.number)(Schema.struct({
        _tag: Schema.literal("SampleMessage")
      }))

      const SampleProtocol = Schema.union(SampleMessage)

      const SampleEntity = RecipientType.makeEntityType("Sample", SampleProtocol)

      yield* _(Sharding.registerEntity(SampleEntity, ({ dequeue, replyStream }) =>
        pipe(
          PoisonPill.takeOrInterrupt(dequeue),
          Effect.flatMap((msg) =>
            replyStream(
              msg,
              pipe(
                Stream.never,
                Stream.ensuring(Deferred.succeed(exit, true)), // <- signal interruption on shard side
                Stream.interruptAfter(Duration.millis(500))
              )
            )
          ),
          Effect.forever
        )))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      const msg = yield* _(SampleMessage.makeEffect({ _tag: "SampleMessage" }))
      const stream = yield* _(messenger.sendStream("entity1")(msg))
      const result = yield* _(
        Stream.runCollect(stream)
      )

      assertTrue(yield* _(Deferred.await(exit)))
      assertTrue(Chunk.size(result) === 0)
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Behaviour is interrupted if shard is terminated", () => {
    let entityInterrupted = false

    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)
      const entityStarted = yield* _(Deferred.make<never, boolean>())

      const SampleProtocol = Schema.union(
        Schema.struct({
          _tag: Schema.literal("Awake")
        })
      )
      const SampleEntity = RecipientType.makeEntityType("Sample", SampleProtocol)

      yield* _(Sharding.registerEntity(
        SampleEntity,
        ({ dequeue }) =>
          pipe(
            Queue.take(dequeue),
            Effect.flatMap((msg) => {
              if (PoisonPill.isPoisonPill(msg)) {
                return pipe(
                  Effect.sync(() => {
                    entityInterrupted = true
                  }),
                  Effect.zipRight(Effect.interrupt)
                )
              }
              switch (msg._tag) {
                case "Awake":
                  return Deferred.succeed(entityStarted, true)
              }
            }),
            Effect.forever
          ),
        { entityMaxIdleTime: Option.some(Duration.minutes(10)) }
      ))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      yield* _(messenger.sendDiscard("entity1")({ _tag: "Awake" }))
      yield* _(Deferred.await(entityStarted))
    }).pipe(withTestEnv, Effect.runPromise).then(() => assertTrue(entityInterrupted))
  })

  it("Ensure graceful shutdown is completed if shard is terminated", () => {
    let shutdownCompleted = false

    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)
      const entityStarted = yield* _(Deferred.make<never, boolean>())

      const SampleProtocol = Schema.struct({
        _tag: Schema.literal("Awake")
      })

      const SampleEntity = RecipientType.makeEntityType("Sample", SampleProtocol)

      yield* _(Sharding.registerEntity(
        SampleEntity,
        ({ dequeue }) =>
          pipe(
            Queue.take(dequeue),
            Effect.flatMap((msg) => {
              if (PoisonPill.isPoisonPill(msg)) {
                return pipe(
                  Effect.sleep(Duration.seconds(3)),
                  Effect.zipRight(Effect.logDebug("Shutting down...")),
                  Effect.zipRight(
                    Effect.sync(() => {
                      shutdownCompleted = true
                    })
                  ),
                  Effect.flatMap(() => Effect.interrupt)
                )
              }
              return Deferred.succeed(entityStarted, true)
            }),
            Effect.forever
          ),
        { entityMaxIdleTime: Option.some(Duration.minutes(10)) }
      ))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      yield* _(messenger.sendDiscard("entity1")({ _tag: "Awake" }))
      yield* _(Deferred.await(entityStarted))
    }).pipe(withTestEnv, Effect.runPromise).then(() => assertTrue(shutdownCompleted))
  })

  it("Ensure graceful shutdown is completed if entity terminates, and then shard is terminated too", () => {
    let shutdownCompleted = false

    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)
      const shutdownReceived = yield* _(Deferred.make<never, boolean>())

      const SampleProtocol = Schema.union(
        Schema.struct({
          _tag: Schema.literal("Awake")
        })
      )
      const SampleEntity = RecipientType.makeEntityType("Sample", SampleProtocol)

      yield* _(Sharding.registerEntity(
        SampleEntity,
        ({ dequeue }) =>
          pipe(
            Queue.take(dequeue),
            Effect.flatMap((msg) => {
              if (PoisonPill.isPoisonPill(msg)) {
                return pipe(
                  Deferred.succeed(shutdownReceived, true),
                  Effect.zipRight(Effect.sleep(Duration.seconds(3))),
                  Effect.zipRight(Effect.sync(() => {
                    shutdownCompleted = true
                  })),
                  Effect.flatMap(() => Effect.interrupt)
                )
              }
              switch (msg._tag) {
                case "Awake":
                  return Effect.unit
              }
            }),
            Effect.forever
          ),
        { entityMaxIdleTime: Option.some(Duration.millis(100)) }
      ))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      yield* _(messenger.sendDiscard("entity1")({ _tag: "Awake" }))
      yield* _(Deferred.await(shutdownReceived))
    }).pipe(withTestEnv, Effect.runPromise).then(() => assertTrue(shutdownCompleted))
  })

  it("Singletons should start", () => {
    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)
      const received = yield* _(Deferred.make<never, boolean>())

      yield* _(
        Sharding.registerSingleton(
          "sample",
          Deferred.succeed(received, true)
        )
      )

      assertTrue(yield* _(Deferred.await(received)))
    }).pipe(
      Effect.provide(inMemorySharding),
      Effect.scoped,
      Effect.runPromise
    )
  })

  it("Singletons should be interrupted upon sharding stop", () => {
    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)
      const received = yield* _(Deferred.make<never, boolean>())

      yield* _(
        Sharding.registerSingleton(
          "sample",
          pipe(
            Deferred.succeed(received, true),
            Effect.zipRight(Effect.never)
          )
        )
      )

      assertTrue(yield* _(Deferred.await(received)))
    }).pipe(
      Effect.provide(inMemorySharding),
      Effect.scoped,
      Effect.runPromise
    )
  })

  it("If MessageQueue.offer fails, send should fail.", () => {
    const messageQueueConstructor: MessageQueue.MessageQueueConstructor<number> = () => {
      const queue = Effect.runSync(Queue.unbounded<any>())
      return Effect.succeed({
        offer: (msg: any) =>
          PoisonPill.isPoisonPill(msg) ?
            Queue.offer(queue, msg) :
            Effect.fail(ShardingError.ShardingErrorMessageQueue("QUEUE!")),
        dequeue: queue,
        shutdown: Queue.shutdown(queue)
      })
    }

    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)
      const received = yield* _(Ref.make(false))
      const failed = yield* _(Ref.make(false))

      const SampleEntity = RecipientType.makeEntityType("Sample", Schema.number)

      yield* _(
        Sharding.registerEntity(
          SampleEntity,
          ({ dequeue }) => pipe(PoisonPill.takeOrInterrupt(dequeue), Effect.zipRight(Ref.set(received, true))),
          { messageQueueConstructor }
        )
      )

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      yield* _(
        messenger.sendDiscard("entity1")(1),
        Effect.catchTag(ShardingError.ShardingErrorMessageQueueTag, () => Ref.set(failed, true))
      )

      assertTrue(yield* _(Ref.get(failed)))
      assertFalse(yield* _(Ref.get(received)))
    }).pipe(withTestEnv, Effect.runPromise)
  })
})
