import * as Message from "@effect/cluster/Message"
import * as Pods from "@effect/cluster/Pods"
import * as PodsHealth from "@effect/cluster/PodsHealth"
import * as PoisonPill from "@effect/cluster/PoisonPill"
import * as RecipientBehaviour from "@effect/cluster/RecipientBehaviour"
import * as RecipientType from "@effect/cluster/RecipientType"
import * as Serialization from "@effect/cluster/Serialization"
import * as Sharding from "@effect/cluster/Sharding"
import * as ShardingConfig from "@effect/cluster/ShardingConfig"
import * as ShardingError from "@effect/cluster/ShardingError"
import * as ShardManagerClient from "@effect/cluster/ShardManagerClient"
import * as Storage from "@effect/cluster/Storage"
import * as Schema from "@effect/schema/Schema"
import * as Cause from "effect/Cause"
import { Tag } from "effect/Context"
import * as Deferred from "effect/Deferred"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as Fiber from "effect/Fiber"
import { pipe } from "effect/Function"
import * as HashMap from "effect/HashMap"
import * as Layer from "effect/Layer"
import * as Logger from "effect/Logger"
import * as LogLevel from "effect/LogLevel"
import * as Option from "effect/Option"
import * as Queue from "effect/Queue"
import * as Ref from "effect/Ref"
import { describe, expect, it } from "vitest"

interface SampleService {
  value: number
}

const SampleService = Tag<SampleService>()

describe.concurrent("SampleTests", () => {
  const inMemorySharding = pipe(
    Sharding.live,
    Layer.use(PodsHealth.local),
    Layer.use(Pods.noop),
    Layer.use(Storage.memory),
    Layer.use(Serialization.json),
    Layer.use(ShardManagerClient.local),
    Layer.use(
      ShardingConfig.withDefaults({
        simulateRemotePods: true,
        entityTerminationTimeout: Duration.millis(4000),
        sendTimeout: Duration.millis(1000)
      })
    )
  )

  const withTestEnv = <R, E, A>(fa: Effect.Effect<R, E, A>) =>
    pipe(fa, Effect.provide(inMemorySharding), Effect.scoped, Logger.withMinimumLogLevel(LogLevel.Debug))

  it("Succefully delivers a message", () => {
    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)
      const received = yield* _(Ref.make(false))

      const SampleEntity = RecipientType.makeEntityType("Sample", Schema.number)

      yield* _(
        Sharding.registerEntity(
          SampleEntity,
          RecipientBehaviour.fromInMemoryQueue((entityId, dequeue) =>
            pipe(PoisonPill.takeOrInterrupt(dequeue), Effect.zipRight(Ref.set(received, true)))
          )
        )
      )

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      yield* _(messenger.sendDiscard("entity1")(1))

      expect(yield* _(Ref.get(received))).toBe(true)
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Fails with if entity not registered", () => {
    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)
      const SampleEntity = RecipientType.makeEntityType("Sample", Schema.number)

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      const exit = yield* _(messenger.sendDiscard("entity1")(1).pipe(Effect.exit))

      expect(Exit.isFailure(exit)).toBe(true)

      if (Exit.isFailure(exit)) {
        const error = Cause.failureOption(exit.cause)
        expect(Option.isSome(error)).toBe(true)
        if (Option.isSome(error)) {
          expect(ShardingError.isShardingErrorEntityTypeNotRegistered(error.value)).toBe(true)
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

      yield* _(Sharding.registerEntity(
        SampleEntity,
        RecipientBehaviour.fromInMemoryQueue((entityId, dequeue) =>
          pipe(
            PoisonPill.takeOrInterrupt(dequeue),
            Effect.flatMap((msg) => Ref.set(entityId === "entity1" ? result1 : result2, msg))
          )
        )
      ))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      yield* _(messenger.sendDiscard("entity1")(1))
      yield* _(messenger.sendDiscard("entity2")(2))

      expect(yield* _(Ref.get(result1))).toBe(1)
      expect(yield* _(Ref.get(result2))).toBe(2)
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

      yield* _(Sharding.registerEntity(
        SampleEntity,
        RecipientBehaviour.fromInMemoryQueue((entityId, dequeue) =>
          pipe(
            PoisonPill.takeOrInterrupt(dequeue),
            Effect.flatMap((msg) => msg.replier.reply(42))
          )
        )
      ))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      const msg = yield* _(SampleMessage.makeEffect({ _tag: "SampleMessage" }))
      const result = yield* _(messenger.send("entity1")(msg))

      expect(result).toEqual(42)
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

      yield* _(
        Sharding.registerTopic(
          SampleTopic,
          RecipientBehaviour.fromInMemoryQueue((entityId, dequeue) =>
            Effect.flatMap(Ref.make(0), (ref) =>
              pipe(
                PoisonPill.takeOrInterrupt(dequeue),
                Effect.flatMap((msg) => {
                  switch (msg._tag) {
                    case "BroadcastIncrement":
                      return Ref.update(ref, (_) => _ + 1)
                    case "GetIncrement":
                      return Effect.flatMap(Ref.get(ref), msg.replier.reply)
                  }
                }),
                Effect.forever
              ))
          )
        )
      )

      const broadcaster = yield* _(Sharding.broadcaster(SampleTopic))
      yield* _(broadcaster.broadcastDiscard("c1")({ _tag: "BroadcastIncrement" }))
      yield* _(Effect.sleep(Duration.seconds(2)))

      const msg = yield* _(GetIncrement.makeEffect({ _tag: "GetIncrement" }))
      const c1 = yield* _(broadcaster.broadcast("c1")(msg))

      expect(HashMap.size(c1)).toBe(1) // Here we have just one pod, so there will be just one incrementer
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
        RecipientBehaviour.fromInMemoryQueue((entityId, dequeue) =>
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
          )
        ),
        { entityMaxIdleTime: Option.some(Duration.minutes(10)) }
      ))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      yield* _(messenger.sendDiscard("entity1")({ _tag: "Awake" }))
      yield* _(Deferred.await(entityStarted))
    }).pipe(withTestEnv, Effect.runPromise).then(() => expect(entityInterrupted).toBe(true))
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
        RecipientBehaviour.fromInMemoryQueue((entityId, dequeue) =>
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
          )
        ),
        { entityMaxIdleTime: Option.some(Duration.minutes(10)) }
      ))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      yield* _(messenger.sendDiscard("entity1")({ _tag: "Awake" }))
      yield* _(Deferred.await(entityStarted))
    }).pipe(withTestEnv, Effect.runPromise).then(() => expect(shutdownCompleted).toBe(true))
  })

  it("Ensure graceful shutdown is completed if entity terminates, and then shard is terminated too", () => {
    let shutdownCompleted = false

    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)
      const shutdownReceived = yield* _(Deferred.make<never, boolean>())
      const entityStarted = yield* _(Deferred.make<never, boolean>())

      const SampleProtocol = Schema.union(
        Schema.struct({
          _tag: Schema.literal("Awake")
        })
      )
      const SampleEntity = RecipientType.makeEntityType("Sample", SampleProtocol)

      yield* _(Sharding.registerEntity(
        SampleEntity,
        RecipientBehaviour.fromInMemoryQueue((entityId, dequeue) =>
          pipe(
            Queue.take(dequeue),
            Effect.flatMap((msg) => {
              if (PoisonPill.isPoisonPill(msg)) {
                return pipe(
                  Deferred.succeed(shutdownReceived, true),
                  Effect.zipRight(Effect.logDebug("PoisonPill received")),
                  Effect.zipRight(Effect.sleep(Duration.seconds(3))),
                  Effect.zipRight(Effect.sync(() => {
                    shutdownCompleted = true
                  })),
                  Effect.flatMap(() => Effect.interrupt)
                )
              }
              switch (msg._tag) {
                case "Awake":
                  return pipe(
                    Deferred.succeed(entityStarted, true),
                    Effect.zipRight(Effect.logDebug("Entity Started"))
                  )
              }
            }),
            Effect.forever
          )
        ),
        { entityMaxIdleTime: Option.some(Duration.millis(100)) }
      ))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      yield* _(messenger.sendDiscard("entity1")({ _tag: "Awake" }))
      yield* _(Deferred.await(entityStarted))
      yield* _(Deferred.await(shutdownReceived))
    }).pipe(withTestEnv, Effect.runPromise).then(() => expect(shutdownCompleted).toBe(true))
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

      expect(yield* _(Deferred.await(received))).toBe(true)
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

      expect(yield* _(Deferred.await(received))).toBe(true)
    }).pipe(
      Effect.provide(inMemorySharding),
      Effect.scoped,
      Effect.runPromise
    )
  })

  it("If offer fails, send should fail.", () => {
    return Effect.gen(function*(_) {
      yield* _(Sharding.registerScoped)
      const received = yield* _(Ref.make(false))
      const failed = yield* _(Ref.make(false))

      const SampleEntity = RecipientType.makeEntityType("Sample", Schema.number)

      yield* _(
        Sharding.registerEntity(
          SampleEntity,
          pipe(
            RecipientBehaviour.fromInMemoryQueue((entityId, dequeue) =>
              pipe(PoisonPill.takeOrInterrupt(dequeue), Effect.zipRight(Ref.set(received, true)))
            ),
            RecipientBehaviour.mapOffer(() => () => Effect.fail(ShardingError.ShardingErrorMessageQueue("ERROR!")))
          )
        )
      )

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      yield* _(
        messenger.sendDiscard("entity1")(1),
        Effect.catchTag(ShardingError.ShardingErrorMessageQueueTag, () => Ref.set(failed, true))
      )

      expect(yield* _(Ref.get(failed))).toBe(true)
      expect(yield* _(Ref.get(received))).toBe(false)
    }).pipe(withTestEnv, Effect.runPromise)
  })

  it("Upon entity termination, pending replies should get errored", () => {
    return Effect.gen(function*(_) {
      const requestReceived = yield* _(Deferred.make<never, boolean>())
      yield* _(Sharding.registerScoped)
      const SampleRequest = Message.schema(Schema.number)(
        Schema.struct({
          _tag: Schema.literal("Request")
        })
      )

      const SampleProtocol = Schema.union(
        SampleRequest,
        PoisonPill.schema
      )
      const SampleEntity = RecipientType.makeEntityType("Sample", SampleProtocol)

      yield* _(Sharding.registerEntity(
        SampleEntity,
        RecipientBehaviour.fromInMemoryQueue((entityId, dequeue) =>
          pipe(
            PoisonPill.takeOrInterrupt(dequeue),
            Effect.flatMap(() => {
              // ignored reply as part of test case
              return pipe(
                Deferred.succeed(requestReceived, true),
                Effect.zipRight(Effect.logDebug("Request received, ignoring reply as part of test case..."))
              )
            }),
            Effect.forever
          )
        ),
        { entityMaxIdleTime: Option.some(Duration.millis(100)) }
      ))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      const msg = yield* _(SampleRequest.makeEffect({ _tag: "Request" }))
      const replyFiber = yield* _(
        messenger.send("entity1")(msg),
        Effect.fork
      )
      yield* _(Deferred.await(requestReceived))
      yield* _(Sharding.unregister)
      const exit = yield* _(Fiber.await(replyFiber))
      const expectedExit = Exit.fail(ShardingError.ShardingErrorSendTimeout())

      expect(Exit.isFailure(exit)).toBe(true)
      expect(exit.toString() === expectedExit.toString()).toBe(true)
    }).pipe(withTestEnv, Effect.runPromise)
  })
})
