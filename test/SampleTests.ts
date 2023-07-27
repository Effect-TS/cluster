import * as Chunk from "@effect/data/Chunk"
import * as Duration from "@effect/data/Duration"
import { equals } from "@effect/data/Equal"
import { pipe } from "@effect/data/Function"
import * as HashMap from "@effect/data/HashMap"
import * as Option from "@effect/data/Option"
import * as Cause from "@effect/io/Cause"
import * as Deferred from "@effect/io/Deferred"
import * as Effect from "@effect/io/Effect"
import * as Exit from "@effect/io/Exit"
import * as Layer from "@effect/io/Layer"
import * as Queue from "@effect/io/Queue"
import * as Ref from "@effect/io/Ref"
import * as Schema from "@effect/schema/Schema"
import * as Message from "@effect/shardcake/Message"
import * as Pods from "@effect/shardcake/Pods"
import * as PodsHealth from "@effect/shardcake/PodsHealth"
import * as RecipientType from "@effect/shardcake/RecipientType"
import * as Serialization from "@effect/shardcake/Serialization"
import { isEntityTypeNotRegistered } from "@effect/shardcake/ShardError"
import * as Sharding from "@effect/shardcake/Sharding"
import * as ShardingConfig from "@effect/shardcake/ShardingConfig"
import * as ShardingImpl from "@effect/shardcake/ShardingImpl"
import * as ShardManagerClient from "@effect/shardcake/ShardManagerClient"
import * as Storage from "@effect/shardcake/Storage"
import * as StreamMessage from "@effect/shardcake/StreamMessage"
import { assertTrue } from "@effect/shardcake/test/util"
import * as Stream from "@effect/stream/Stream"

describe.concurrent("SampleTests", () => {
  const inMemorySharding = pipe(
    ShardingImpl.live,
    Layer.use(PodsHealth.local),
    Layer.use(Pods.noop),
    Layer.use(Storage.memory),
    Layer.use(Serialization.json),
    Layer.use(ShardManagerClient.local),
    Layer.use(ShardingConfig.withDefaults({ simulateRemotePods: true }))
  )

  it("Succefully delivers a message", () => {
    return Effect.gen(function*(_) {
      const received = yield* _(Ref.make(false))

      const SampleEntity = RecipientType.makeEntityType("Sample", Schema.number)
      yield* _(Sharding.registerEntity(SampleEntity, () => Ref.set(received, true)))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      yield* _(messenger.sendDiscard("entity1")(1))

      assertTrue(yield* _(Ref.get(received)))
    }).pipe(Effect.provideSomeLayer(inMemorySharding), Effect.scoped, Effect.runPromise)
  })

  it("Fails with if entity not registered", () => {
    return Effect.gen(function*(_) {
      const SampleEntity = RecipientType.makeEntityType("Sample", Schema.number)

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      const exit = yield* _(messenger.sendDiscard("entity1")(1).pipe(Effect.exit))

      assertTrue(Exit.isFailure(exit))

      if (Exit.isFailure(exit)) {
        const error = Cause.failureOption(exit.cause)
        assertTrue(Option.isSome(error))
        if (Option.isSome(error)) {
          assertTrue(isEntityTypeNotRegistered(error.value))
        }
      }
    }).pipe(Effect.provideSomeLayer(inMemorySharding), Effect.scoped, Effect.runPromise)
  })

  it("Succefully delivers a message to the correct entity", () => {
    return Effect.gen(function*(_) {
      const result1 = yield* _(Ref.make(0))
      const result2 = yield* _(Ref.make(0))

      const SampleEntity = RecipientType.makeEntityType("Sample", Schema.number)
      yield* _(Sharding.registerEntity(SampleEntity, (entityId, queue) =>
        pipe(
          Queue.take(queue),
          Effect.flatMap((msg) => Ref.set(entityId === "entity1" ? result1 : result2, msg))
        )))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      yield* _(messenger.sendDiscard("entity1")(1))
      yield* _(messenger.sendDiscard("entity2")(2))

      assertTrue(1 === (yield* _(Ref.get(result1))))
      assertTrue(2 === (yield* _(Ref.get(result2))))
    }).pipe(Effect.provideSomeLayer(inMemorySharding), Effect.scoped, Effect.runPromise)
  })

  it("Succefully delivers a message with a reply to an entity", () => {
    return Effect.gen(function*(_) {
      const [SampleMessage_, SampleMessage] = Message.schema(Schema.number)(Schema.struct({
        _tag: Schema.literal("SampleMessage")
      }))
      const SampleEntity = RecipientType.makeEntityType("Sample", SampleMessage_)
      yield* _(Sharding.registerEntity(SampleEntity, (entityId, queue) =>
        pipe(
          Queue.take(queue),
          Effect.flatMap((msg) => msg.replier.reply(42))
        )))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      const result = yield* _(messenger.send("entity1")(SampleMessage({ _tag: "SampleMessage" })))

      assertTrue(result === 42)
    }).pipe(Effect.provideSomeLayer(inMemorySharding), Effect.scoped, Effect.runPromise)
  })

  it("Succefully broadcasts a message", () => {
    return Effect.gen(function*(_) {
      const [GetIncrement_, GetIncrement] = Message.schema(Schema.number)(Schema.struct({
        _tag: Schema.literal("GetIncrement")
      }))

      const SampleMessage = Schema.union(
        Schema.struct({
          _tag: Schema.literal("BroadcastIncrement")
        }),
        GetIncrement_
      )

      const SampleTopic = RecipientType.makeTopicType("Sample", SampleMessage)
      yield* _(Sharding.registerTopic(SampleTopic, (entityId, queue) =>
        Effect.flatMap(Ref.make(0), (ref) =>
          pipe(
            Queue.take(queue),
            Effect.flatMap((msg) => {
              switch (msg._tag) {
                case "BroadcastIncrement":
                  return Ref.update(ref, (_) => _ + 1)
                case "GetIncrement":
                  return Effect.flatMap(Ref.get(ref), (_) => msg.replier.reply(_))
              }
            }),
            Effect.forever
          ))))

      const broadcaster = yield* _(Sharding.broadcaster(SampleTopic))
      yield* _(broadcaster.broadcastDiscard("c1")({ _tag: "BroadcastIncrement" }))
      yield* _(Effect.sleep(Duration.seconds(2)))

      const c1 = yield* _(broadcaster.broadcast("c1")(GetIncrement({ _tag: "GetIncrement" })))

      assertTrue(1 === HashMap.size(c1)) // Here we have just one pod, so there will be just one incrementer
    }).pipe(Effect.provideSomeLayer(inMemorySharding), Effect.scoped, Effect.runPromise)
  })

  it("Succefully delivers a message with a streaming reply to an entity", () => {
    return Effect.gen(function*(_) {
      const [SampleMessage_, SampleMessage] = StreamMessage.schema(Schema.number)(Schema.struct({
        _tag: Schema.literal("SampleMessage")
      }))
      const SampleEntity = RecipientType.makeEntityType("Sample", SampleMessage_)
      yield* _(Sharding.registerEntity(SampleEntity, (entityId, queue) =>
        pipe(
          Queue.take(queue),
          Effect.flatMap((msg) => msg.replier.reply(Stream.fromIterable([1, 2, 3]))),
          Effect.forever
        )))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      const stream = yield* _(messenger.sendStream("entity1")(SampleMessage({ _tag: "SampleMessage" })))
      const result = yield* _(Stream.runCollect(stream))

      assertTrue(equals(result, Chunk.fromIterable([1, 2, 3])))
    }).pipe(Effect.provideSomeLayer(inMemorySharding), Effect.scoped, Effect.runPromise)
  })

  it("When the messenger interrupts, the stream on the entity should too", () => {
    return Effect.gen(function*(_) {
      const exit = yield* _(Deferred.make<never, boolean>())
      const [SampleMessage_, SampleMessage] = StreamMessage.schema(Schema.number)(Schema.struct({
        _tag: Schema.literal("SampleMessage")
      }))
      const SampleEntity = RecipientType.makeEntityType("Sample", SampleMessage_)
      yield* _(Sharding.registerEntity(SampleEntity, (entityId, queue) =>
        pipe(
          Queue.take(queue),
          Effect.flatMap((msg) =>
            msg.replier.reply(pipe(
              Stream.never(),
              Stream.ensuring(Deferred.succeed(exit, true)), // <- signal interruption on shard side
              Stream.map(() => 42)
            ))
          ),
          Effect.forever
        )))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      const stream = yield* _(messenger.sendStream("entity1")(SampleMessage({ _tag: "SampleMessage" })))
      yield* _(
        Stream.runDrain(stream.pipe(
          Stream.interruptAfter(Duration.millis(500)) // <- interrupts after a while
        ))
      )

      yield* _(Deferred.await(exit)) // <- hangs
      assertTrue(true)
    }).pipe(Effect.provideSomeLayer(inMemorySharding), Effect.scoped, Effect.runPromise)
  })

  it("When the stream on entity interrupts, the stream on the messenger should close", () => {
    return Effect.gen(function*(_) {
      const exit = yield* _(Deferred.make<never, boolean>())
      const [SampleMessage_, SampleMessage] = StreamMessage.schema(Schema.number)(Schema.struct({
        _tag: Schema.literal("SampleMessage")
      }))
      const SampleEntity = RecipientType.makeEntityType("Sample", SampleMessage_)
      yield* _(Sharding.registerEntity(SampleEntity, (entityId, queue) =>
        pipe(
          Queue.take(queue),
          Effect.flatMap((msg) =>
            msg.replier.reply(pipe(
              Stream.never(),
              Stream.ensuring(Deferred.succeed(exit, true)), // <- signal interruption on shard side
              Stream.interruptAfter(Duration.millis(500))
            ))
          ),
          Effect.forever
        )))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      const stream = yield* _(messenger.sendStream("entity1")(SampleMessage({ _tag: "SampleMessage" })))
      const result = yield* _(
        Stream.runCollect(stream)
      )

      assertTrue(yield* _(Deferred.await(exit)))
      assertTrue(Chunk.size(result) === 0)
    }).pipe(Effect.provideSomeLayer(inMemorySharding), Effect.scoped, Effect.runPromise)
  })

  it("Queue is shutdown if shard is terminated", () => {
    let entityInterrupted = false

    return Effect.gen(function*(_) {
      const entityStarted = yield* _(Deferred.make<never, boolean>())

      const SampleMessage = Schema.union(
        Schema.struct({
          _tag: Schema.literal("Awake")
        })
      )
      const SampleEntity = RecipientType.makeEntityType("Sample", SampleMessage)

      yield* _(Sharding.registerEntity(
        SampleEntity,
        (entityId, queue) =>
          pipe(
            Queue.take(queue),
            Effect.flatMap((msg) => {
              switch (msg._tag) {
                case "Awake":
                  return Deferred.succeed(entityStarted, true)
              }
            }),
            Effect.forever,
            Effect.catchAllCause(() => {
              entityInterrupted = true
              return Effect.unit
            })
          ),
        false,
        Option.some(Duration.minutes(10))
      ))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      yield* _(messenger.sendDiscard("entity1")({ _tag: "Awake" }))
      yield* _(Deferred.await(entityStarted))
      yield* _(Sharding.registerScoped)
    }).pipe(Effect.provideSomeLayer(inMemorySharding), Effect.scoped, Effect.runPromise).then(() =>
      assertTrue(entityInterrupted)
    )
  })

  it("Behaviour is interrupted if shard is terminated", () => {
    let entityInterrupted = false

    return Effect.gen(function*(_) {
      const entityStarted = yield* _(Deferred.make<never, boolean>())

      const SampleMessage = Schema.union(
        Schema.struct({
          _tag: Schema.literal("Awake")
        })
      )
      const SampleEntity = RecipientType.makeEntityType("Sample", SampleMessage)

      yield* _(Sharding.registerEntity(
        SampleEntity,
        (entityId, queue) =>
          pipe(
            Queue.take(queue),
            Effect.flatMap((msg) => {
              switch (msg._tag) {
                case "Awake":
                  return Deferred.succeed(entityStarted, true)
              }
            }),
            Effect.forever,
            Effect.onInterrupt(() => {
              entityInterrupted = true
              return Effect.unit
            })
          ),
        false,
        Option.some(Duration.minutes(10))
      ))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      yield* _(messenger.sendDiscard("entity1")({ _tag: "Awake" }))
      yield* _(Deferred.await(entityStarted))
      yield* _(Sharding.registerScoped)
    }).pipe(Effect.provideSomeLayer(inMemorySharding), Effect.scoped, Effect.runPromise).then(() =>
      assertTrue(entityInterrupted)
    )
  })

  it("Ensure graceful shutdown is completed if shard is terminated", () => {
    let shutdownCompleted = false

    return Effect.gen(function*(_) {
      const entityStarted = yield* _(Deferred.make<never, boolean>())

      const SampleMessage = Schema.union(
        Schema.struct({
          _tag: Schema.literal("Awake")
        })
      )
      const SampleEntity = RecipientType.makeEntityType("Sample", SampleMessage)

      yield* _(Sharding.registerEntity(
        SampleEntity,
        (entityId, queue) =>
          pipe(
            Queue.take(queue),
            Effect.flatMap(() => Deferred.succeed(entityStarted, true)),
            Effect.forever,
            Effect.onInterrupt(() =>
              pipe(
                Effect.sleep(Duration.seconds(3)),
                Effect.zipRight(
                  Effect.sync(() => {
                    shutdownCompleted = true
                  })
                ),
                Effect.uninterruptible
              )
            )
          ),
        true,
        Option.some(Duration.minutes(10))
      ))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      yield* _(messenger.sendDiscard("entity1")({ _tag: "Awake" }))
      yield* _(Deferred.await(entityStarted))
      yield* _(Sharding.registerScoped)
    }).pipe(Effect.provideSomeLayer(inMemorySharding), Effect.scoped, Effect.runPromise).then(() =>
      assertTrue(shutdownCompleted)
    )
  })

  it("Ensure graceful shutdown is completed if entity terminates, and then shard is terminated too", () => {
    let shutdownCompleted = false

    return Effect.gen(function*(_) {
      const shutdownReceived = yield* _(Deferred.make<never, boolean>())

      const SampleMessage = Schema.union(
        Schema.struct({
          _tag: Schema.literal("Awake")
        })
      )
      const SampleEntity = RecipientType.makeEntityType("Sample", SampleMessage)

      yield* _(Sharding.registerEntity(
        SampleEntity,
        (entityId, queue) =>
          pipe(
            Queue.take(queue),
            Effect.flatMap((msg) => {
              switch (msg._tag) {
                case "Awake":
                  return Effect.unit
              }
            }),
            Effect.forever,
            Effect.onInterrupt(() =>
              pipe(
                Deferred.succeed(shutdownReceived, true),
                Effect.zipRight(Effect.sleep(Duration.seconds(3))),
                Effect.zipRight(Effect.sync(() => {
                  shutdownCompleted = true
                })),
                Effect.uninterruptible
              )
            )
          ),
        true,
        Option.some(Duration.millis(100))
      ))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      yield* _(messenger.sendDiscard("entity1")({ _tag: "Awake" }))
      yield* _(Deferred.await(shutdownReceived))
      yield* _(Sharding.registerScoped)
    }).pipe(Effect.provideSomeLayer(inMemorySharding), Effect.scoped, Effect.runPromise).then(() =>
      assertTrue(shutdownCompleted)
    )
  })
})
