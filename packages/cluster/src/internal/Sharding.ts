/**
 * @since 1.0.0
 */
import type * as Schema from "@effect/schema/Schema"
import { Tag } from "effect/Context"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import type * as Either from "effect/Either"
import * as Equal from "effect/Equal"
import { equals } from "effect/Equal"
import * as Fiber from "effect/Fiber"
import { pipe } from "effect/Function"
import * as HashMap from "effect/HashMap"
import * as HashSet from "effect/HashSet"
import * as Layer from "effect/Layer"
import * as List from "effect/List"
import * as Option from "effect/Option"
import * as PubSub from "effect/PubSub"
import * as Ref from "effect/Ref"
import * as Schedule from "effect/Schedule"
import type * as Scope from "effect/Scope"
import * as Stream from "effect/Stream"
import * as Synchronized from "effect/SynchronizedRef"
import type * as Broadcaster from "../Broadcaster.js"
import * as Message from "../Message.js"
import type { Messenger } from "../Messenger.js"
import * as PodAddress from "../PodAddress.js"
import * as Pods from "../Pods.js"
import type * as RecipientBehaviour from "../RecipientBehaviour.js"
import * as RecipientType from "../RecipientType.js"
import type * as ReplyId from "../ReplyId.js"
import * as Serialization from "../Serialization.js"
import * as SerializedEnvelope from "../SerializedEnvelope.js"
import type * as SerializedMessage from "../SerializedMessage.js"
import * as ShardId from "../ShardId.js"
import type * as Sharding from "../Sharding.js"
import * as ShardingConfig from "../ShardingConfig.js"
import * as ShardingError from "../ShardingError.js"
import * as ShardingRegistrationEvent from "../ShardingRegistrationEvent.js"
import * as ShardManagerClient from "../ShardManagerClient.js"
import * as Storage from "../Storage.js"
import * as EntityManager from "./entityManager.js"
import { MessageReturnedNotingDefect, NotAMessageWithReplierDefect, showHashSet } from "./utils.js"

/**
 * @internal
 */
export const shardingTag: Tag<Sharding.Sharding, Sharding.Sharding> = Tag<Sharding.Sharding>()

/**
 * @internal
 */
export const register: Effect.Effect<Sharding.Sharding, never, void> = Effect.flatMap(shardingTag, (_) => _.register)

/**
 * @internal
 */
export const unregister: Effect.Effect<Sharding.Sharding, never, void> = Effect.flatMap(
  shardingTag,
  (_) => _.unregister
)

/**
 * @internal
 */
export const registerScoped: Effect.Effect<Sharding.Sharding | Scope.Scope, never, void> = pipe(
  register,
  Effect.zipRight(Effect.addFinalizer(() => unregister))
)

/**
 * @internal
 */
export function registerSingleton<R>(
  name: string,
  run: Effect.Effect<R, never, void>
): Effect.Effect<Sharding.Sharding | R, never, void> {
  return Effect.flatMap(shardingTag, (_) => _.registerSingleton(name, run))
}

/**
 * @internal
 */
export function registerEntity<Req, R>(
  entityType: RecipientType.EntityType<Req>,
  behavior: RecipientBehaviour.RecipientBehaviour<R, Req>,
  options?: RecipientBehaviour.EntityBehaviourOptions
): Effect.Effect<Sharding.Sharding | Exclude<R, RecipientBehaviour.RecipientBehaviourContext>, never, void> {
  return Effect.flatMap(shardingTag, (_) => _.registerEntity(entityType, behavior, options))
}

/**
 * @internal
 */
export function registerTopic<Req, R>(
  topicType: RecipientType.TopicType<Req>,
  behavior: RecipientBehaviour.RecipientBehaviour<R, Req>,
  options?: RecipientBehaviour.EntityBehaviourOptions
): Effect.Effect<Sharding.Sharding | Exclude<R, RecipientBehaviour.RecipientBehaviourContext>, never, void> {
  return Effect.flatMap(shardingTag, (_) => _.registerTopic(topicType, behavior, options))
}

/**
 * @internal
 */
export function messenger<Msg>(
  entityType: RecipientType.EntityType<Msg>,
  sendTimeout?: Option.Option<Duration.Duration>
): Effect.Effect<Sharding.Sharding, never, Messenger<Msg>> {
  return Effect.map(shardingTag, (_) => _.messenger(entityType, sendTimeout))
}

/**
 * @internal
 */
export function broadcaster<Msg>(
  topicType: RecipientType.TopicType<Msg>,
  sendTimeout?: Option.Option<Duration.Duration>
): Effect.Effect<Sharding.Sharding, never, Broadcaster.Broadcaster<Msg>> {
  return Effect.map(shardingTag, (_) => _.broadcaster(topicType, sendTimeout))
}

/**
 * @internal
 */
export const getPods: Effect.Effect<Sharding.Sharding, never, HashSet.HashSet<PodAddress.PodAddress>> = Effect.flatMap(
  shardingTag,
  (_) => _.getPods
)

type SingletonEntry = [string, Effect.Effect<never, never, void>, Option.Option<Fiber.Fiber<never, void>>]

/**
 * @internal
 */
function make(
  layerScope: Scope.Scope,
  address: PodAddress.PodAddress,
  config: ShardingConfig.ShardingConfig,
  shardAssignments: Ref.Ref<HashMap.HashMap<ShardId.ShardId, PodAddress.PodAddress>>,
  entityManagers: Ref.Ref<HashMap.HashMap<string, EntityManager.EntityManager<unknown>>>,
  singletons: Synchronized.SynchronizedRef<
    List.List<SingletonEntry>
  >,
  // lastUnhealthyNodeReported: Ref.Ref<Date>,
  isShuttingDownRef: Ref.Ref<boolean>,
  shardManager: ShardManagerClient.ShardManagerClient,
  pods: Pods.Pods,
  storage: Storage.Storage,
  serialization: Serialization.Serialization,
  eventsHub: PubSub.PubSub<ShardingRegistrationEvent.ShardingRegistrationEvent>
) {
  function decodeRequest<Req>(
    envelope: SerializedEnvelope.SerializedEnvelope
  ): Effect.Effect<
    never,
    ShardingError.ShardingErrorSerialization | ShardingError.ShardingErrorEntityTypeNotRegistered,
    readonly [Req, EntityManager.EntityManager<Req>]
  > {
    return pipe(
      Ref.get(entityManagers),
      Effect.map(HashMap.get(envelope.entityType)),
      Effect.flatMap((_) =>
        Effect.unified(Option.match(_, {
          onNone: () => Effect.fail(ShardingError.ShardingErrorEntityTypeNotRegistered(envelope.entityType, address)),
          onSome: (entityManager) =>
            pipe(
              serialization.decode(
                (entityManager as EntityManager.EntityManager<Req>).recipientType.schema,
                envelope.body
              ),
              Effect.map((request) => [request, entityManager as EntityManager.EntityManager<Req>] as const)
            )
        }))
      )
    )
  }

  function encodeReply<Req>(
    request: Req,
    reply: Option.Option<Message.Success<Req>>
  ): Effect.Effect<
    never,
    ShardingError.ShardingErrorSerialization,
    Option.Option<SerializedMessage.SerializedMessage>
  > {
    if (Option.isNone(reply)) {
      return Effect.succeed(Option.none())
    }
    if (!Message.isMessage(request)) {
      return Effect.die(NotAMessageWithReplierDefect(request))
    }
    return pipe(
      serialization.encode(request.replier.schema, reply),
      Effect.map(Option.some)
    )
  }

  function decodeReply<Req>(
    request: Req,
    body: Option.Option<SerializedMessage.SerializedMessage>
  ): Effect.Effect<never, ShardingError.ShardingErrorSerialization, Option.Option<Message.Success<Req>>> {
    if (Option.isNone(body)) {
      return Effect.succeed(Option.none())
    }
    if (!Message.isMessage(request)) {
      return Effect.die(NotAMessageWithReplierDefect(request))
    }
    return pipe(
      serialization.decode(
        request.replier.schema as Schema.Schema<unknown, Message.Success<Req>>,
        body.value
      ),
      Effect.map(Option.some)
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
    Effect.logDebug("Begin unregistering from ShardManager..."),
    Effect.zipRight(shardManager.getAssignments),
    Effect.matchCauseEffect({
      onFailure: (_) => Effect.logWarning("Shard Manager not available. Can't unregister cleanly", _),
      onSuccess: () =>
        pipe(
          Effect.logDebug(`Stopping local entities`),
          Effect.zipRight(pipe(isShuttingDownRef, Ref.set(true))),
          Effect.zipRight(
            pipe(
              Ref.get(entityManagers),
              Effect.flatMap(
                Effect.forEach(
                  ([name, entityManager]) =>
                    pipe(
                      entityManager.terminateAllEntities,
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
      Effect.zipRight(PubSub.publish(eventsHub, ShardingRegistrationEvent.SingletonRegistered(name)))
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

  function sendToLocalEntity(
    envelope: SerializedEnvelope.SerializedEnvelope
  ): Effect.Effect<
    never,
    ShardingError.ShardingError,
    Option.Option<SerializedMessage.SerializedMessage>
  > {
    return Effect.gen(function*(_) {
      const [request, entityManager] = yield* _(decodeRequest(envelope))
      return yield* _(
        entityManager.send(envelope.entityId, request, envelope.replyId),
        Effect.flatMap((_) => encodeReply(request, _))
      )
    })
  }

  function sendToPod<Msg>(
    recipientTypeName: string,
    entityId: string,
    msg: Msg,
    msgSchema: Schema.Schema<unknown, Msg>,
    pod: PodAddress.PodAddress,
    replyId: Option.Option<ReplyId.ReplyId>
  ): Effect.Effect<
    never,
    ShardingError.ShardingError,
    Option.Option<
      Message.Success<Msg>
    >
  > {
    if (config.simulateRemotePods && equals(pod, address)) {
      return pipe(
        serialization.encode(msgSchema, msg),
        Effect.flatMap((bytes) =>
          pipe(
            decodeRequest(SerializedEnvelope.make(entityId, recipientTypeName, bytes, replyId)),
            Effect.flatMap(([request, entityManager]) => entityManager.send(entityId, request, replyId))
          )
        )
      )
    } else if (equals(pod, address)) {
      // if pod = self, shortcut and send directly without serialization
      return pipe(
        Ref.get(entityManagers),
        Effect.flatMap(
          (_) =>
            pipe(
              HashMap.get(_, recipientTypeName),
              Option.match(
                {
                  onNone: () =>
                    Effect.fail<ShardingError.ShardingError>(
                      ShardingError.ShardingErrorEntityTypeNotRegistered(recipientTypeName, pod)
                    ),
                  onSome: (entityManager) =>
                    (entityManager as EntityManager.EntityManager<Msg>).send(
                      entityId,
                      msg,
                      replyId
                    )
                }
              )
            )
        ),
        Effect.unified
      )
    } else {
      return pipe(
        serialization.encode(msgSchema, msg),
        Effect.flatMap((bytes) => {
          const errorHandling = (_: never) => Effect.die("Not handled yet")

          const envelope = SerializedEnvelope.make(entityId, recipientTypeName, bytes, replyId)

          return pipe(
            pods.sendMessage(pod, envelope),
            Effect.tapError(errorHandling),
            Effect.flatMap((_) => decodeReply(msg, _)),
            Effect.unified
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
      return <A extends Msg & Message.Message<any>>(msg: A) => {
        return pipe(
          sendMessage(entityId, msg, Option.some(msg.replier.id)),
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
      }
    }

    function sendMessage<A extends Msg>(
      entityId: string,
      msg: A,
      replyId: Option.Option<ReplyId.ReplyId>
    ): Effect.Effect<never, ShardingError.ShardingError, Option.Option<Message.Success<A>>> {
      const shardId = getShardId(entityType, entityId)

      const trySend: Effect.Effect<
        never,
        ShardingError.ShardingError,
        Option.Option<
          Message.Success<A>
        >
      > = pipe(
        Effect.Do,
        Effect.bind("shards", () => Ref.get(shardAssignments)),
        Effect.let("pod", ({ shards }) => HashMap.get(shards, shardId)),
        Effect.bind("response", ({ pod }) => {
          if (Option.isSome(pod)) {
            return pipe(
              sendToPod<Msg>(
                entityType.name,
                entityId,
                msg,
                entityType.schema,
                pod.value,
                replyId
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
              })
            )
          }

          return pipe(
            Effect.sleep(Duration.millis(100)),
            Effect.zipRight(trySend)
          )
        }),
        Effect.map((_) => _.response)
      )

      return trySend
    }

    return { sendDiscard, send }
  }

  function broadcaster<Msg>(
    topicType: RecipientType.TopicType<Msg>,
    sendTimeout: Option.Option<Duration.Duration> = Option.none()
  ): Broadcaster.Broadcaster<Msg> {
    const timeout = pipe(
      sendTimeout,
      Option.getOrElse(() => config.sendTimeout)
    )

    function sendMessage<A extends Msg>(
      topic: string,
      body: A,
      replyId: Option.Option<ReplyId.ReplyId>
    ): Effect.Effect<
      never,
      ShardingError.ShardingError,
      HashMap.HashMap<PodAddress.PodAddress, Either.Either<ShardingError.ShardingError, Message.Success<A>>>
    > {
      return pipe(
        Effect.Do,
        Effect.bind("pods", () => getPods),
        Effect.bind("response", ({ pods }) =>
          Effect.forEach(pods, (pod) => {
            const trySend: Effect.Effect<
              never,
              ShardingError.ShardingError,
              Option.Option<Message.Success<A>>
            > = pipe(
              sendToPod(
                topicType.name,
                topic,
                body,
                topicType.schema,
                pod,
                replyId
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
              })
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
      return <A extends Msg & Message.Message<any>>(msg: A) => {
        return pipe(
          sendMessage(topic, msg, Option.some(msg.replier.id)),
          Effect.interruptible
        )
      }
    }

    return { broadcast, broadcastDiscard }
  }

  function registerEntity<R, Req>(
    entityType: RecipientType.EntityType<Req>,
    behavior: RecipientBehaviour.RecipientBehaviour<R, Req>,
    options?: RecipientBehaviour.EntityBehaviourOptions
  ): Effect.Effect<Exclude<R, RecipientBehaviour.RecipientBehaviourContext>, never, void> {
    return pipe(
      registerRecipient(entityType, behavior, options),
      Effect.zipRight(PubSub.publish(eventsHub, ShardingRegistrationEvent.EntityRegistered(entityType))),
      Effect.asUnit
    )
  }

  function registerTopic<R, Req>(
    topicType: RecipientType.TopicType<Req>,
    behavior: RecipientBehaviour.RecipientBehaviour<R, Req>,
    options?: RecipientBehaviour.EntityBehaviourOptions
  ): Effect.Effect<Exclude<R, RecipientBehaviour.RecipientBehaviourContext>, never, void> {
    return pipe(
      registerRecipient(topicType, behavior, options),
      Effect.zipRight(PubSub.publish(eventsHub, ShardingRegistrationEvent.TopicRegistered(topicType))),
      Effect.asUnit
    )
  }

  const getShardingRegistrationEvents: Stream.Stream<
    never,
    never,
    ShardingRegistrationEvent.ShardingRegistrationEvent
  > = Stream.fromPubSub(eventsHub)

  function registerRecipient<R, Req>(
    recipientType: RecipientType.RecipientType<Req>,
    behavior: RecipientBehaviour.RecipientBehaviour<R, Req>,
    options?: RecipientBehaviour.EntityBehaviourOptions
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
        Ref.update(entityManagers, HashMap.set(recipientType.name, entityManager as any))
      )
    })
  }

  const registerScoped = Effect.acquireRelease(register, (_) => unregister)

  const self: Sharding.Sharding = {
    getShardId,
    register,
    unregister,
    registerScoped,
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
    sendToLocalEntity
  }

  return self
}
/**
 * @internal
 */
export const live = Layer.scoped(
  shardingTag,
  Effect.gen(function*(_) {
    const config = yield* _(ShardingConfig.ShardingConfig)
    const pods = yield* _(Pods.Pods)
    const shardManager = yield* _(ShardManagerClient.ShardManagerClient)
    const storage = yield* _(Storage.Storage)
    const serialization = yield* _(Serialization.Serialization)
    const shardsCache = yield* _(Ref.make(HashMap.empty<ShardId.ShardId, PodAddress.PodAddress>()))
    const entityManagers = yield* _(Ref.make(HashMap.empty<string, EntityManager.EntityManager<unknown>>()))
    const shuttingDown = yield* _(Ref.make(false))
    const eventsHub = yield* _(PubSub.unbounded<ShardingRegistrationEvent.ShardingRegistrationEvent>())
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
      entityManagers,
      singletons,
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
