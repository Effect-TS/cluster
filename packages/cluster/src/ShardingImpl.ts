/**
 * @since 1.0.0
 */
import * as BinaryMessage from "@effect/cluster/BinaryMessage"
import type * as Broadcaster from "@effect/cluster/Broadcaster"
import type * as ByteArray from "@effect/cluster/ByteArray"
import * as EntityManager from "@effect/cluster/EntityManager"
import * as EntityState from "@effect/cluster/EntityState"
import * as Message from "@effect/cluster/Message"
import type { Messenger } from "@effect/cluster/Messenger"
import * as PodAddress from "@effect/cluster/PodAddress"
import * as Pods from "@effect/cluster/Pods"
import type * as RecipientBehaviour from "@effect/cluster/RecipientBehaviour"
import * as RecipientType from "@effect/cluster/RecipientType"
import type { Replier } from "@effect/cluster/Replier"
import * as ReplyChannel from "@effect/cluster/ReplyChannel"
import * as ReplyId from "@effect/cluster/ReplyId"
import * as Serialization from "@effect/cluster/Serialization"
import * as ShardId from "@effect/cluster/ShardId"
import * as Sharding from "@effect/cluster/Sharding"
import * as ShardingConfig from "@effect/cluster/ShardingConfig"
import * as ShardingError from "@effect/cluster/ShardingError"
import * as ShardingRegistrationEvent from "@effect/cluster/ShardingRegistrationEvent"
import * as ShardManagerClient from "@effect/cluster/ShardManagerClient"
import * as Storage from "@effect/cluster/Storage"
import * as StreamMessage from "@effect/cluster/StreamMessage"
import type * as StreamReplier from "@effect/cluster/StreamReplier"
import { MessageReturnedNotingDefect, NotAMessageWithReplierDefect, showHashSet } from "@effect/cluster/utils"
import type * as Schema from "@effect/schema/Schema"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import type * as Either from "effect/Either"
import * as Equal from "effect/Equal"
import { equals } from "effect/Equal"
import * as Fiber from "effect/Fiber"
import { pipe } from "effect/Function"
import * as HashMap from "effect/HashMap"
import * as HashSet from "effect/HashSet"
import * as Hub from "effect/Hub"
import * as Layer from "effect/Layer"
import * as List from "effect/List"
import * as Option from "effect/Option"
import * as Ref from "effect/Ref"
import * as Schedule from "effect/Schedule"
import type * as Scope from "effect/Scope"
import * as Stream from "effect/Stream"
import * as Synchronized from "effect/SynchronizedRef"

type SingletonEntry = [string, Effect.Effect<never, never, void>, Option.Option<Fiber.Fiber<never, void>>]

/** @internal */
function make(
  layerScope: Scope.Scope,
  address: PodAddress.PodAddress,
  config: ShardingConfig.ShardingConfig,
  shardAssignments: Ref.Ref<HashMap.HashMap<ShardId.ShardId, PodAddress.PodAddress>>,
  entityStates: Ref.Ref<HashMap.HashMap<string, EntityState.EntityState>>,
  singletons: Synchronized.SynchronizedRef<
    List.List<SingletonEntry>
  >,
  replyChannels: Synchronized.SynchronizedRef<
    HashMap.HashMap<ReplyId.ReplyId, ReplyChannel.ReplyChannel<any>>
  >, // reply channel for each pending reply,
  // lastUnhealthyNodeReported: Ref.Ref<Date>,
  isShuttingDownRef: Ref.Ref<boolean>,
  shardManager: ShardManagerClient.ShardManagerClient,
  pods: Pods.Pods,
  storage: Storage.Storage,
  serialization: Serialization.Serialization,
  eventsHub: Hub.Hub<ShardingRegistrationEvent.ShardingRegistrationEvent>
) {
  function decodeRequest<Req>(
    binaryMessage: BinaryMessage.BinaryMessage
  ): Effect.Effect<
    never,
    ShardingError.ShardingErrorSerialization | ShardingError.ShardingErrorEntityTypeNotRegistered,
    readonly [Req, EntityManager.EntityManager<Req>]
  > {
    return pipe(
      Ref.get(entityStates),
      Effect.map(HashMap.get(binaryMessage.entityType)),
      Effect.flatMap((_) =>
        Effect.unified(Option.match(_, {
          onNone: () =>
            Effect.fail(ShardingError.ShardingErrorEntityTypeNotRegistered(binaryMessage.entityType, address)),
          onSome: (entityState) =>
            pipe(
              serialization.decode(
                binaryMessage.body,
                (entityState.entityManager as EntityManager.EntityManager<Req>).recipientType.schema
              ),
              Effect.map((request) => [request, entityState.entityManager as EntityManager.EntityManager<Req>] as const)
            )
        }))
      )
    )
  }

  function encodeReply<Req>(
    request: Req,
    reply: Message.Success<Req> | StreamMessage.Success<Req>
  ) {
    if (!Message.isMessage(request) && !StreamMessage.isStreamMessage(request)) {
      return Effect.die(NotAMessageWithReplierDefect(request))
    }
    return pipe(
      serialization.encode(reply, request.replier.schema)
    )
  }

  function decodeReply<Req, Res>(
    request: Req,
    body: ByteArray.ByteArray
  ) {
    if (!Message.isMessage(request) && !StreamMessage.isStreamMessage(request)) {
      return Effect.die(NotAMessageWithReplierDefect(request))
    }
    return pipe(
      serialization.decode(body, request.replier.schema as Schema.Schema<unknown, Res>)
    )
  }

  function getShardId(recipientType: RecipientType.RecipientType<any>, entityId: string): ShardId.ShardId {
    return RecipientType.getShardId(entityId, config.numberOfShards)
  }

  const register: Effect.Effect<never, never, void> = pipe(
    Effect.logDebug(`Registering pod ${PodAddress.show(address)} to Shard Manager`),
    Effect.zipRight(pipe(isShuttingDownRef, Ref.set(false))),
    Effect.zipRight(shardManager.register(address))
  )

  const unregister: Effect.Effect<never, never, void> = pipe(
    shardManager.getAssignments,
    Effect.matchCauseEffect({
      onFailure: (_) => Effect.logWarning("Shard Manager not available. Can't unregister cleanly", _),
      onSuccess: () =>
        pipe(
          Effect.logDebug(`Stopping local entities`),
          Effect.zipRight(pipe(isShuttingDownRef, Ref.set(true))),
          Effect.zipRight(
            pipe(
              Ref.get(entityStates),
              Effect.flatMap(
                Effect.forEach(
                  ([name, entityState]) =>
                    pipe(
                      entityState.entityManager.terminateAllEntities,
                      Effect.catchAllCause(
                        (_) => Effect.logError("Error during stop of entity " + name, _)
                      )
                    ),
                  { discard: true }
                )
              )
            )
          ),
          Effect.zipRight(
            Effect.logDebug(`Unregistering pod ${PodAddress.show(address)} to Shard Manager`)
          ),
          Effect.zipRight(shardManager.unregister(address))
        )
    })
  )

  const isSingletonNode: Effect.Effect<never, never, boolean> = pipe(
    Ref.get(shardAssignments),
    Effect.map((_) =>
      pipe(
        HashMap.get(_, ShardId.make(1)),
        Option.match({
          onNone: () => false,
          onSome: equals(address)
        })
      )
    )
  )

  const startSingletonsIfNeeded: Effect.Effect<never, never, void> = pipe(
    Synchronized.updateEffect(
      singletons,
      (singletons) =>
        pipe(
          Effect.forEach(singletons, ([name, run, maybeExecutionFiber]) =>
            Option.match(
              maybeExecutionFiber,
              {
                onNone: () =>
                  pipe(
                    Effect.logDebug("Starting singleton " + name),
                    Effect.zipRight(
                      Effect.map(
                        Effect.forkIn(layerScope)(run),
                        (fiber) => [name, run, Option.some(fiber)] as SingletonEntry
                      )
                    )
                  ),
                onSome: (_) => Effect.succeed([name, run, maybeExecutionFiber] as SingletonEntry)
              }
            )),
          Effect.map(List.fromIterable)
        )
    ),
    Effect.whenEffect(isSingletonNode),
    Effect.asUnit
  )

  const stopSingletonsIfNeeded: Effect.Effect<never, never, void> = pipe(
    Synchronized.updateEffect(
      singletons,
      (singletons) =>
        pipe(
          Effect.forEach(singletons, ([name, run, maybeExecutionFiber]) =>
            Option.match(
              maybeExecutionFiber,
              {
                onNone: () => Effect.succeed([name, run, maybeExecutionFiber] as SingletonEntry),
                onSome: (fiber) =>
                  pipe(
                    Effect.logDebug("Stopping singleton " + name),
                    Effect.zipRight(
                      Effect.as(Fiber.interrupt(fiber), [name, run, Option.none()] as SingletonEntry)
                    )
                  )
              }
            )),
          Effect.map(List.fromIterable)
        )
    ),
    Effect.unlessEffect(isSingletonNode),
    Effect.asUnit
  )

  function registerSingleton<R>(name: string, run: Effect.Effect<R, never, void>): Effect.Effect<R, never, void> {
    return pipe(
      Effect.context<R>(),
      Effect.flatMap((context) =>
        Synchronized.update(
          singletons,
          (list) => (List.prepend(list, [name, Effect.provide(run, context), Option.none()] as SingletonEntry))
        )
      ),
      Effect.zipLeft(startSingletonsIfNeeded),
      Effect.zipRight(Hub.publish(eventsHub, ShardingRegistrationEvent.SingletonRegistered(name)))
    )
  }

  const isShuttingDown: Effect.Effect<never, never, boolean> = Ref.get(isShuttingDownRef)

  function assign(shards: HashSet.HashSet<ShardId.ShardId>): Effect.Effect<never, never, void> {
    return pipe(
      Ref.update(shardAssignments, (_) => HashSet.reduce(shards, _, (_, shardId) => HashMap.set(_, shardId, address))),
      Effect.zipRight(startSingletonsIfNeeded),
      Effect.zipLeft(Effect.logDebug("Assigned shards: " + showHashSet(ShardId.show)(shards))),
      Effect.unlessEffect(isShuttingDown),
      Effect.asUnit
    )
  }

  function unassign(shards: HashSet.HashSet<ShardId.ShardId>): Effect.Effect<never, never, void> {
    return pipe(
      Ref.update(shardAssignments, (_) =>
        HashSet.reduce(shards, _, (_, shardId) => {
          const value = HashMap.get(_, shardId)
          if (Option.isSome(value) && equals(value.value, address)) {
            return HashMap.remove(_, shardId)
          }
          return _
        })),
      Effect.zipRight(stopSingletonsIfNeeded),
      Effect.zipLeft(Effect.logDebug("Unassigning shards: " + showHashSet(ShardId.show)(shards)))
    )
  }

  function isEntityOnLocalShards(
    recipientType: RecipientType.RecipientType<any>,
    entityId: string
  ): Effect.Effect<never, never, boolean> {
    return pipe(
      Effect.Do,
      Effect.bind("shards", () => Ref.get(shardAssignments)),
      Effect.let("shardId", () => getShardId(recipientType, entityId)),
      Effect.let("pod", ({ shardId, shards }) => pipe(shards, HashMap.get(shardId))),
      Effect.map((_) => Option.isSome(_.pod) && equals(_.pod.value, address))
    )
  }

  const getPods: Effect.Effect<never, never, HashSet.HashSet<PodAddress.PodAddress>> = pipe(
    Ref.get(shardAssignments),
    Effect.map((_) => HashSet.fromIterable(HashMap.values(_)))
  )

  function updateAssignments(
    assignmentsOpt: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>,
    fromShardManager: boolean
  ) {
    const assignments = HashMap.map(assignmentsOpt, (v, _) => Option.getOrElse(v, () => address))

    if (fromShardManager) {
      return Ref.update(shardAssignments, (map) => (HashMap.isEmpty(map)) ? assignments : map)
    }

    return Ref.update(shardAssignments, (map) => {
      // we keep self assignments (we don't override them with the new assignments
      // because only the Shard Manager is able to change assignments of the current node, via assign/unassign
      return HashMap.union(
        pipe(
          assignments,
          HashMap.filter((pod, _) => !Equal.equals(pod, address))
        ),
        pipe(
          map,
          HashMap.filter((pod, _) => Equal.equals(pod, address))
        )
      )
    })
  }

  const refreshAssignments: Effect.Effect<Scope.Scope, never, void> = pipe(
    Stream.fromEffect(Effect.map(shardManager.getAssignments, (_) => [_, true] as const)),
    Stream.merge(
      pipe(
        storage.assignmentsStream,
        Stream.map((_) => [_, false] as const)
      )
    ),
    Stream.mapEffect(([assignmentsOpt, fromShardManager]) => updateAssignments(assignmentsOpt, fromShardManager)),
    Stream.tap(() => startSingletonsIfNeeded),
    Stream.runDrain,
    Effect.retry(Schedule.fixed(config.refreshAssignmentsRetryInterval)),
    Effect.interruptible,
    Effect.forkScoped,
    Effect.asUnit
  )

  function sendToLocalEntitySingleReply(
    msg: BinaryMessage.BinaryMessage
  ): Effect.Effect<
    never,
    ShardingError.ShardingError,
    Option.Option<ByteArray.ByteArray>
  > {
    return pipe(sendToLocalEntityStreamingReply(msg), Stream.runHead)
  }

  function sendToLocalEntityStreamingReply(
    msg: BinaryMessage.BinaryMessage
  ): Stream.Stream<
    never,
    ShardingError.ShardingError,
    ByteArray.ByteArray
  > {
    return pipe(
      Effect.gen(function*(_) {
        const [request, entityManager] = yield* _(decodeRequest(msg))
        const replyChannel = yield* _(ReplyChannel.make<any>())
        yield* _(entityManager.send(msg.entityId, request, msg.replyId, replyChannel))
        return pipe(
          replyChannel.output,
          Stream.mapEffect((reply) => encodeReply<any>(request, reply))
        )
      }),
      Stream.fromEffect,
      Stream.flatten()
    )
  }

  function initReply(
    id: ReplyId.ReplyId,
    replyChannel: ReplyChannel.ReplyChannel<any>
  ): Effect.Effect<never, never, void> {
    return pipe(
      replyChannels,
      Synchronized.update(HashMap.set(id, replyChannel)),
      Effect.zipLeft(
        pipe(
          replyChannel.await,
          Effect.ensuring(Synchronized.update(replyChannels, HashMap.remove(id))),
          Effect.forkIn(layerScope)
        )
      )
    )
  }

  function reply<Reply>(reply: Reply, replier: Replier<Reply>): Effect.Effect<never, never, void> {
    return Synchronized.updateEffect(replyChannels, (repliers) =>
      pipe(
        Effect.suspend(() => {
          const replyChannel = HashMap.get(repliers, replier.id)

          if (Option.isSome(replyChannel)) {
            return (replyChannel.value as ReplyChannel.ReplyChannel<Reply>).replySingle(reply)
          }
          return Effect.unit
        }),
        Effect.as(pipe(repliers, HashMap.remove(replier.id)))
      ))
  }

  function replyStream<Reply>(
    replies: Stream.Stream<never, never, Reply>,
    replier: StreamReplier.StreamReplier<Reply>
  ): Effect.Effect<never, never, void> {
    return Synchronized.updateEffect(replyChannels, (repliers) =>
      pipe(
        Effect.suspend(() => {
          const replyChannel = HashMap.get(repliers, replier.id)

          if (Option.isSome(replyChannel)) {
            return (replyChannel.value as ReplyChannel.ReplyChannel<Reply>).replyStream(replies)
          }
          return Effect.unit
        }),
        Effect.as(pipe(repliers, HashMap.remove(replier.id)))
      ))
  }

  function sendToPod<Msg, Res>(
    recipientTypeName: string,
    entityId: string,
    msg: Msg,
    msgSchema: Schema.Schema<unknown, Msg>,
    pod: PodAddress.PodAddress,
    replyId: Option.Option<ReplyId.ReplyId>,
    replyChannel: ReplyChannel.ReplyChannel<Res>
  ): Effect.Effect<
    never,
    ShardingError.ShardingError,
    void
  > {
    if (config.simulateRemotePods && equals(pod, address)) {
      return pipe(
        serialization.encode(msg, msgSchema),
        Effect.flatMap((bytes) =>
          pipe(
            decodeRequest(BinaryMessage.make(entityId, recipientTypeName, bytes, replyId)),
            Effect.flatMap(([request, entityManager]) => entityManager.send(entityId, request, replyId, replyChannel))
          )
        ),
        Effect.asUnit
      )
    } else if (equals(pod, address)) {
      // if pod = self, shortcut and send directly without serialization
      return pipe(
        Ref.get(entityStates),
        Effect.flatMap(
          (_) =>
            pipe(
              HashMap.get(_, recipientTypeName),
              Option.match(
                {
                  onNone: () =>
                    Effect.fail(
                      ShardingError.ShardingErrorEntityTypeNotRegistered(recipientTypeName, pod)
                    ),
                  onSome: (state) =>
                    pipe(
                      (state.entityManager as EntityManager.EntityManager<Msg>).send(
                        entityId,
                        msg,
                        replyId,
                        replyChannel
                      )
                    )
                }
              ),
              Effect.unified
            )
        )
      )
    } else {
      return pipe(
        serialization.encode(msg, msgSchema),
        Effect.flatMap((bytes) => {
          const errorHandling = (_: never) => Effect.die("Not handled yet")

          const binaryMessage = BinaryMessage.make(entityId, recipientTypeName, bytes, replyId)

          return pipe(
            replyChannel.replyStream(pipe(
              pods.sendMessageStreaming(pod, binaryMessage),
              Stream.tapError(errorHandling),
              Stream.mapEffect((bytes) => decodeReply<Msg, Res>(msg, bytes))
            ))
          )
        })
      )
    }
  }

  function messenger<Msg>(
    entityType: RecipientType.EntityType<Msg>,
    sendTimeout: Option.Option<Duration.Duration> = Option.none()
  ): Messenger<Msg> {
    const timeout = pipe(
      sendTimeout,
      Option.getOrElse(() => config.sendTimeout)
    )

    function sendDiscard(entityId: string) {
      return (msg: Msg) => pipe(sendMessage(entityId, msg, Option.none()), Effect.timeout(timeout), Effect.asUnit)
    }

    function send(entityId: string) {
      return <A extends Msg & Message.Message<any>>(fn: (replyId: ReplyId.ReplyId) => A) => {
        return pipe(
          ReplyId.makeEffect,
          Effect.flatMap((replyId) => {
            const body = fn(replyId)
            return pipe(
              sendMessage<Message.Success<A>>(entityId, body, Option.some(replyId)),
              Effect.flatMap((_) => {
                if (Option.isSome(_)) return Effect.succeed(_.value)
                return Effect.die(MessageReturnedNotingDefect(entityId))
              }),
              Effect.timeoutFail({
                onTimeout: ShardingError.ShardingErrorSendTimeout,
                duration: timeout
              }),
              Effect.interruptible
            )
          })
        )
      }
    }

    function sendStream(entityId: string) {
      return <A extends Msg & StreamMessage.StreamMessage<any>>(fn: (replyId: ReplyId.ReplyId) => A) => {
        return pipe(
          ReplyId.makeEffect,
          Effect.flatMap((replyId) => {
            const body = fn(replyId)
            return sendMessageStreaming<StreamMessage.Success<A>>(entityId, body, Option.some(replyId))
          })
        )
      }
    }

    function sendMessage<Res>(
      entityId: string,
      msg: Msg,
      replyId: Option.Option<ReplyId.ReplyId>
    ): Effect.Effect<never, ShardingError.ShardingError, Option.Option<Res>> {
      return pipe(
        sendMessageStreaming<Res>(entityId, msg, replyId),
        Effect.map(Stream.runHead),
        Effect.flatten
      )
    }

    function sendMessageStreaming<Res>(
      entityId: string,
      msg: Msg,
      replyId: Option.Option<ReplyId.ReplyId>
    ): Effect.Effect<never, ShardingError.ShardingError, Stream.Stream<never, ShardingError.ShardingError, Res>> {
      return Effect.gen(function*(_) {
        const replyChannel = yield* _(ReplyChannel.make<Res>())
        yield* _(sendMessageGeneric(entityId, msg, replyId, replyChannel))
        return replyChannel.output
      })
    }

    function sendMessageGeneric<Res>(
      entityId: string,
      msg: Msg,
      replyId: Option.Option<ReplyId.ReplyId>,
      replyChannel: ReplyChannel.ReplyChannel<Res>
    ) {
      const shardId = getShardId(entityType, entityId)

      const trySend: Effect.Effect<never, ShardingError.ShardingError, void> = pipe(
        Effect.Do,
        Effect.bind("shards", () => Ref.get(shardAssignments)),
        Effect.let("pod", ({ shards }) => HashMap.get(shards, shardId)),
        Effect.bind("response", ({ pod }) => {
          if (Option.isSome(pod)) {
            return pipe(
              sendToPod<Msg, Res>(
                entityType.name,
                entityId,
                msg,
                entityType.schema,
                pod.value,
                replyId,
                replyChannel
              ),
              Effect.catchSome((_) => {
                if (
                  ShardingError.isShardingErrorEntityNotManagedByThisPod(_) ||
                  ShardingError.isShardingErrorPodUnavailable(_)
                ) {
                  return pipe(
                    Effect.sleep(Duration.millis(200)),
                    Effect.zipRight(trySend),
                    Option.some
                  )
                }
                return Option.none()
              }),
              Effect.onError(replyChannel.fail)
            )
          }

          return pipe(Effect.sleep(Duration.millis(100)), Effect.zipRight(trySend))
        }),
        Effect.asUnit
      )

      return trySend
    }

    return { sendDiscard, send, sendStream }
  }

  function broadcaster<Msg>(
    topicType: RecipientType.TopicType<Msg>,
    sendTimeout: Option.Option<Duration.Duration> = Option.none()
  ): Broadcaster.Broadcaster<Msg> {
    const timeout = pipe(
      sendTimeout,
      Option.getOrElse(() => config.sendTimeout)
    )

    function sendMessage<Res>(
      topic: string,
      body: Msg,
      replyId: Option.Option<ReplyId.ReplyId>
    ): Effect.Effect<
      never,
      ShardingError.ShardingError,
      HashMap.HashMap<PodAddress.PodAddress, Either.Either<ShardingError.ShardingError, Res>>
    > {
      return pipe(
        Effect.Do,
        Effect.bind("pods", () => getPods),
        Effect.bind("response", ({ pods }) =>
          Effect.forEach(pods, (pod) => {
            const trySend: Effect.Effect<never, ShardingError.ShardingError, Option.Option<Res>> = Effect.gen(
              function*(_) {
                const replyChannel = yield* _(ReplyChannel.make<Res>())
                yield* _(pipe(
                  sendToPod<Msg, Res>(
                    topicType.name,
                    topic,
                    body,
                    topicType.schema,
                    pod,
                    replyId,
                    replyChannel
                  ),
                  Effect.catchSome((_) => {
                    if (ShardingError.isShardingErrorPodUnavailable(_)) {
                      return pipe(
                        Effect.sleep(Duration.millis(200)),
                        Effect.zipRight(trySend),
                        Option.some
                      )
                    }
                    return Option.none()
                  }),
                  Effect.onError(replyChannel.fail)
                ))
                return yield* _(Stream.runHead(replyChannel.output))
              }
            )

            return pipe(
              trySend,
              Effect.flatMap((_) => {
                if (Option.isSome(_)) return Effect.succeed(_.value)
                return Effect.die(MessageReturnedNotingDefect(topic))
              }),
              Effect.timeoutFail({
                onTimeout: ShardingError.ShardingErrorSendTimeout,
                duration: timeout
              }),
              Effect.either,
              Effect.map((res) => [pod, res] as const)
            )
          }, { concurrency: "inherit" })),
        Effect.map((_) => _.response),
        Effect.map(HashMap.fromIterable)
      )
    }

    function broadcastDiscard(topic: string) {
      return (msg: Msg) => pipe(sendMessage(topic, msg, Option.none()), Effect.timeout(timeout), Effect.asUnit)
    }

    function broadcast(topic: string) {
      return <A extends Msg & Message.Message<any>>(fn: (replyId: ReplyId.ReplyId) => Msg) => {
        return pipe(
          ReplyId.makeEffect,
          Effect.flatMap((replyId) => {
            const body = fn(replyId)
            return pipe(
              sendMessage<Message.Success<A>>(topic, body, Option.some(replyId)),
              Effect.interruptible
            )
          })
        )
      }
    }

    return { broadcast, broadcastDiscard }
  }

  function registerEntity<R, Req>(
    entityType: RecipientType.EntityType<Req>,
    behavior: RecipientBehaviour.RecipientBehaviour<R, Req>,
    options?: RecipientBehaviour.EntityBehaviourOptions<Req>
  ): Effect.Effect<R, never, void> {
    return pipe(
      registerRecipient(entityType, behavior, options),
      Effect.zipRight(Hub.publish(eventsHub, ShardingRegistrationEvent.EntityRegistered(entityType))),
      Effect.asUnit
    )
  }

  function registerTopic<R, Req>(
    topicType: RecipientType.TopicType<Req>,
    behavior: RecipientBehaviour.RecipientBehaviour<R, Req>,
    options?: RecipientBehaviour.EntityBehaviourOptions<Req>
  ): Effect.Effect<R, never, void> {
    return pipe(
      registerRecipient(topicType, behavior, options),
      Effect.zipRight(Hub.publish(eventsHub, ShardingRegistrationEvent.TopicRegistered(topicType))),
      Effect.asUnit
    )
  }

  const getShardingRegistrationEvents: Stream.Stream<
    never,
    never,
    ShardingRegistrationEvent.ShardingRegistrationEvent
  > = Stream.fromHub(eventsHub)

  function registerRecipient<R, Req>(
    recipientType: RecipientType.RecipientType<Req>,
    behavior: RecipientBehaviour.RecipientBehaviour<R, Req>,
    options?: RecipientBehaviour.EntityBehaviourOptions<Req>
  ) {
    return Effect.gen(function*($) {
      const entityManager = yield* $(
        EntityManager.make(
          recipientType,
          behavior,
          self,
          config,
          options
        )
      )

      yield* $(
        Ref.update(entityStates, HashMap.set(recipientType.name, EntityState.make(entityManager as any)))
      )
    })
  }

  const registerScoped = Effect.acquireRelease(register, (_) => Effect.orDie(unregister))

  const self: Sharding.Sharding = {
    getShardId,
    register,
    unregister,
    registerScoped,
    initReply,
    reply,
    replyStream,
    messenger,
    broadcaster,
    isEntityOnLocalShards,
    isShuttingDown,
    registerSingleton,
    registerEntity,
    registerTopic,
    assign,
    unassign,
    getShardingRegistrationEvents,
    getPods,
    refreshAssignments,
    sendToLocalEntitySingleReply,
    sendToLocalEntityStreamingReply
  }

  return self
}

/**
 * @since 1.0.0
 * @category layers
 */
export const live = Layer.scoped(
  Sharding.Sharding,
  Effect.gen(function*(_) {
    const config = yield* _(ShardingConfig.ShardingConfig)
    const pods = yield* _(Pods.Pods)
    const shardManager = yield* _(ShardManagerClient.ShardManagerClient)
    const storage = yield* _(Storage.Storage)
    const serialization = yield* _(Serialization.Serialization)
    const shardsCache = yield* _(Ref.make(HashMap.empty<ShardId.ShardId, PodAddress.PodAddress>()))
    const entityStates = yield* _(Ref.make(HashMap.empty<string, EntityState.EntityState>()))
    const shuttingDown = yield* _(Ref.make(false))
    const eventsHub = yield* _(Hub.unbounded<ShardingRegistrationEvent.ShardingRegistrationEvent>())
    const replyChannels = yield* _(Synchronized.make(
      HashMap.empty<ReplyId.ReplyId, ReplyChannel.ReplyChannel<any>>()
    ))
    const singletons = yield* _(Synchronized.make<List.List<SingletonEntry>>(List.nil()))
    const layerScope = yield* _(Effect.scope)
    yield* _(Effect.addFinalizer(() =>
      pipe(
        Synchronized.get(singletons),
        Effect.flatMap(
          Effect.forEach(([_, __, fa]) => Option.isSome(fa) ? Fiber.interrupt(fa.value) : Effect.unit)
        )
      )
    ))

    const sharding = make(
      layerScope,
      PodAddress.make(config.selfHost, config.shardingPort),
      config,
      shardsCache,
      entityStates,
      singletons,
      replyChannels,
      shuttingDown,
      shardManager,
      pods,
      storage,
      serialization,
      eventsHub
    )

    yield* _(sharding.refreshAssignments)

    return sharding
  })
)
