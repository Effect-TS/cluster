import * as Chunk from "@effect/data/Chunk"
import * as Duration from "@effect/data/Duration"
import { equals } from "@effect/data/Equal"
import { pipe } from "@effect/data/Function"
import * as Deferred from "@effect/io/Deferred"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import * as Queue from "@effect/io/Queue"
import * as Ref from "@effect/io/Ref"
import * as Schema from "@effect/schema/Schema"
import * as Message from "@effect/shardcake/Message"
import * as Pods from "@effect/shardcake/Pods"
import * as PodsHealth from "@effect/shardcake/PodsHealth"
import * as RecipientType from "@effect/shardcake/RecipientType"
import * as Serialization from "@effect/shardcake/Serialization"
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
    Layer.use(ShardingConfig.defaults)
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

  it("When the messager interrupts, the stream on the entity should too", () => {
    return Effect.gen(function*(_) {
      const exit = yield* _(Deferred.make<never, any>())
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
              Stream.ensuring(Deferred.succeed(exit, true)), // <- signal completion
              Stream.map(() => 42)
            ))
          ),
          Effect.forever
        )))

      const messenger = yield* _(Sharding.messenger(SampleEntity))
      const stream = yield* _(messenger.sendStream("entity1")(SampleMessage({ _tag: "SampleMessage" })))
      yield* _(
        Stream.runDrain(stream.pipe(
          Stream.ensuring(Effect.sync(() => console.log("interrupting stream"))),
          Stream.interruptAfter(Duration.millis(2000))
        ))
      )

      yield* _(Deferred.await(exit)) // <- hangs
      assertTrue(true)
    }).pipe(Effect.provideSomeLayer(inMemorySharding), Effect.scoped, Effect.runPromise)
  })
})
