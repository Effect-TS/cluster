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
import * as MessageState from "../MessageState.js"
import type { Messenger } from "../Messenger.js"
import * as PodAddress from "../PodAddress.js"
import * as Pods from "../Pods.js"
import type * as RecipientBehaviour from "../RecipientBehaviour.js"
import type * as RecipientBehaviourContext from "../RecipientBehaviourContext.js"
import * as RecipientType from "../RecipientType.js"
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
import { NotAMessageWithReplierDefect, showHashSet } from "./utils.js"

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
export function registerEntity<Msg extends Message.Any, R>(
  entityType: RecipientType.EntityType<Msg>,
  behavior: RecipientBehaviour.RecipientBehaviour<R, Msg>,
  options?: RecipientBehaviour.EntityBehaviourOptions
): Effect.Effect<Sharding.Sharding | Exclude<R, RecipientBehaviourContext.RecipientBehaviourContext>, never, void> {
  return Effect.flatMap(shardingTag, (_) => _.registerEntity(entityType, behavior, options))
}

/**
 * @internal
 */
export function registerTopic<Msg extends Message.Any, R>(
  topicType: RecipientType.TopicType<Msg>,
  behavior: RecipientBehaviour.RecipientBehaviour<R, Msg>,
  options?: RecipientBehaviour.EntityBehaviourOptions
): Effect.Effect<Sharding.Sharding | Exclude<R, RecipientBehaviourContext.RecipientBehaviourContext>, never, void> {
  return Effect.flatMap(shardingTag, (_) => _.registerTopic(topicType, behavior, options))
}

/**
 * @internal
 */
export function messenger<Msg extends Message.Any>(
  entityType: RecipientType.EntityType<Msg>,
  sendTimeout?: Option.Option<Duration.Duration>
): Effect.Effect<Sharding.Sharding, never, Messenger<Msg>> {
  return Effect.map(shardingTag, (_) => _.messenger(entityType, sendTimeout))
}

/**
 * @internal
 */
export function broadcaster<Msg extends Message.Any>(
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

/**
 * @internal
 */
export const sendMessageToLocalEntityManagerWithoutRetries: (
  msg: SerializedEnvelope.SerializedEnvelope
) => Effect.Effect<
  Sharding.Sharding,
  ShardingError.ShardingError,
  MessageState.MessageState<SerializedMessage.SerializedMessage>
> = (msg) => Effect.flatMap(shardingTag, (_) => _.sendMessageToLocalEntityManagerWithoutRetries(msg))

/**
 * @internal
 */
export const getAssignedShardIds: Effect.Effect<
  Sharding.Sharding,
  never,
  HashSet.HashSet<ShardId.ShardId>
> = Effect.flatMap(shardingTag, (_) => _.getAssignedShardIds)

type SingletonEntry = [string, Effect.Effect<never, never, void>, Option.Option<Fiber.Fiber<never, void>>]

/**
 * @internal
 */
function make(
  layerScope: Scope.Scope,
  address: PodAddress.PodAddress,
  config: ShardingConfig.ShardingConfig,
  shardAssignments: Ref.Ref<HashMap.HashMap<ShardId.ShardId, PodAddress.PodAddress>>,
  entityManagers: Ref.Ref<HashMap.HashMap<string, EntityManager.EntityManager<any>>>,
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
  function getEntityManagerByEntityTypeName<Msg extends Message.Any>(
    entityType: string
  ) {
    return pipe(
      Ref.get(entityManagers),
      Effect.map(HashMap.get(entityType)),
      Effect.flatMap((_) =>
        Effect.unified(Option.match(_, {
          onNone: () => Effect.fail(ShardingError.ShardingErrorEntityTypeNotRegistered(entityType, address)),
          onSome: (entityManager) => Effect.succeed(entityManager as EntityManager.EntityManager<Msg>)
        }))
      )
    )
  }

  function getShardId(entityId: string): ShardId.ShardId {
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

  function getPodAddressForShardId(
    shardId: ShardId.ShardId
  ): Effect.Effect<never, never, Option.Option<PodAddress.PodAddress>> {
    return pipe(
      Ref.get(shardAssignments),
      Effect.map((shards) => HashMap.get(shards, shardId))
    )
  }

  function isEntityOnLocalShards(
    entityId: string
  ): Effect.Effect<never, never, boolean> {
    return pipe(
      getPodAddressForShardId(getShardId(entityId)),
      Effect.map((_) => Option.isSome(_) && equals(_.value, address))
    )
  }

  const getPods: Effect.Effect<never, never, HashSet.HashSet<PodAddress.PodAddress>> = pipe(
    Ref.get(shardAssignments),
    Effect.map((_) => HashSet.fromIterable(HashMap.values(_)))
  )

  const getAssignedShardIds: Effect.Effect<never, never, HashSet.HashSet<ShardId.ShardId>> = pipe(
    Ref.get(shardAssignments),
    Effect.map(HashMap.filter((_) => equals(_, address))),
    Effect.map(HashMap.keySet)
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

  function sendMessageToLocalEntityManagerWithoutRetries(
    envelope: SerializedEnvelope.SerializedEnvelope
  ): Effect.Effect<
    never,
    ShardingError.ShardingError,
    MessageState.MessageState<SerializedMessage.SerializedMessage>
  > {
    return Effect.gen(function*(_) {
      const entityManager = yield* _(getEntityManagerByEntityTypeName(envelope.entityType))
      const request = yield* _(serialization.decode(entityManager.recipientType.schema, envelope.body))
      return yield* _(
        entityManager.sendAndGetState(envelope.entityId, request),
        Effect.flatMap((_) =>
          MessageState.mapEffect(
            _,
            (body: any) =>
              !Message.isMessageWithResult(request)
                ? Effect.die(NotAMessageWithReplierDefect(request))
                : serialization.encode(Message.successSchema(request), body)
          )
        )
      )
    }).pipe(Effect.annotateLogs("envelope", envelope))
  }

  function sendMessageToRemotePodWithoutRetries(
    pod: PodAddress.PodAddress,
    envelope: SerializedEnvelope.SerializedEnvelope
  ): Effect.Effect<
    never,
    ShardingError.ShardingError,
    MessageState.MessageState<SerializedMessage.SerializedMessage>
  > {
    const errorHandling = (_: never) => Effect.die("Not handled yet")

    return pipe(
      pods.sendAndGetState(pod, envelope),
      Effect.tapError(errorHandling),
      Effect.annotateLogs("pod", pod),
      Effect.annotateLogs("envelope", envelope)
    )
  }

  function sendMessageToPodWithoutRetries(
    pod: PodAddress.PodAddress,
    envelope: SerializedEnvelope.SerializedEnvelope
  ): Effect.Effect<
    never,
    ShardingError.ShardingError,
    MessageState.MessageState<SerializedMessage.SerializedMessage>
  > {
    return equals(pod, address)
      ? sendMessageToLocalEntityManagerWithoutRetries(envelope)
      : sendMessageToRemotePodWithoutRetries(pod, envelope)
  }

  function messenger<Msg extends Message.Any>(
    entityType: RecipientType.EntityType<Msg>,
    sendTimeout: Option.Option<Duration.Duration> = Option.none()
  ): Messenger<Msg> {
    const timeout = pipe(
      sendTimeout,
      Option.getOrElse(() => config.sendTimeout)
    )

    function sendDiscard(entityId: string) {
      return (msg: Msg) =>
        pipe(
          sendMessage(entityId, msg),
          Effect.timeoutFail({
            onTimeout: ShardingError.ShardingErrorSendTimeout,
            duration: timeout
          }),
          Effect.asUnit
        )
    }

    function unsafeSendDiscard(entityId: string) {
      return (msg: Message.Payload<Msg>) =>
        pipe(
          Message.makeEffect(msg),
          Effect.flatMap((_) => sendDiscard(entityId)(_ as any))
        )
    }

    function send(entityId: string) {
      return <A extends Msg & Message.AnyWithResult>(msg: A) => {
        return pipe(
          sendMessage(entityId, msg),
          Effect.flatMap((state) =>
            MessageState.mapEffect(state, (body) => serialization.decode(Message.successSchema(msg), body))
          ),
          Effect.flatMap((state) =>
            pipe(
              state,
              MessageState.match({
                onAcknowledged: () => Effect.fail(ShardingError.ShardingErrorNoResultInProcessedMessageState()),
                onProcessed: (state) =>
                  Option.isNone(state.result)
                    ? Effect.fail(
                      ShardingError.ShardingErrorNoResultInProcessedMessageState()
                    )
                    : Effect.succeed(state.result.value)
              }),
              Effect.unified
            )
          ),
          Effect.retry(pipe(
            Schedule.fixed(100),
            Schedule.whileInput((error: unknown) => ShardingError.isShardingErrorNoResultInProcessedMessageState(error))
          )),
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
      msg: A
    ): Effect.Effect<
      never,
      ShardingError.ShardingError,
      MessageState.MessageState<SerializedMessage.SerializedMessage>
    > {
      const shardId = getShardId(entityId)

      return Effect.flatMap(serialization.encode(entityType.schema, msg), (body) =>
        pipe(
          getPodAddressForShardId(shardId),
          Effect.flatMap((pod) =>
            Option.isSome(pod)
              ? Effect.succeed(pod.value)
              : Effect.fail(ShardingError.ShardingErrorEntityNotManagedByThisPod(entityId))
          ),
          Effect.flatMap((pod) =>
            sendMessageToPodWithoutRetries(pod, SerializedEnvelope.make(entityType.name, entityId, body))
          ),
          Effect.retry(pipe(
            Schedule.fixed(Duration.millis(100)),
            Schedule.whileInput((error: unknown) =>
              ShardingError.isShardingErrorPodUnavailable(error) ||
              ShardingError.isShardingErrorEntityNotManagedByThisPod(error)
            )
          ))
        ))
    }

    return { sendDiscard, unsafeSendDiscard, send }
  }

  function broadcaster<Msg extends Message.Any>(
    topicType: RecipientType.TopicType<Msg>,
    sendTimeout: Option.Option<Duration.Duration> = Option.none()
  ): Broadcaster.Broadcaster<Msg> {
    const timeout = pipe(
      sendTimeout,
      Option.getOrElse(() => config.sendTimeout)
    )

    function sendMessage<A extends Msg>(
      topic: string,
      body: A
    ): Effect.Effect<
      never,
      ShardingError.ShardingError,
      HashMap.HashMap<
        PodAddress.PodAddress,
        Either.Either<ShardingError.ShardingError, MessageState.MessageState<SerializedMessage.SerializedMessage>>
      >
    > {
      return Effect.flatMap(serialization.encode(topicType.schema, body), (body) =>
        pipe(
          getPods,
          Effect.flatMap((pods) =>
            Effect.forEach(
              pods,
              (pod) =>
                pipe(
                  sendMessageToPodWithoutRetries(
                    pod,
                    SerializedEnvelope.make(topicType.name, topic, body)
                  ),
                  Effect.retry(pipe(
                    Schedule.fixed(Duration.millis(100)),
                    Schedule.whileInput((error: unknown) =>
                      ShardingError.isShardingErrorPodUnavailable(error) ||
                      ShardingError.isShardingErrorEntityNotManagedByThisPod(error)
                    )
                  )),
                  Effect.timeoutFail({
                    onTimeout: ShardingError.ShardingErrorSendTimeout,
                    duration: timeout
                  }),
                  Effect.either,
                  Effect.map((res) => [pod, res] as const)
                ),
              { concurrency: "inherit" }
            )
          ),
          Effect.map((_) => HashMap.fromIterable(_))
        ))
    }

    function broadcastDiscard(topic: string) {
      return (msg: Msg) =>
        pipe(
          sendMessage(topic, msg),
          Effect.timeoutFail({
            onTimeout: ShardingError.ShardingErrorSendTimeout,
            duration: timeout
          }),
          Effect.asUnit
        )
    }

    function broadcast(topic: string) {
      return <A extends Msg & Message.AnyWithResult>(msg: A) => {
        return pipe(
          sendMessage(topic, msg),
          Effect.flatMap((results) =>
            pipe(
              Effect.forEach(results, ([pod, eitherResult]) =>
                pipe(
                  eitherResult,
                  Effect.flatMap((state) =>
                    MessageState.mapEffect(state, (body) => serialization.decode(Message.successSchema(msg), body))
                  ),
                  Effect.flatMap((state) =>
                    pipe(
                      state,
                      MessageState.match({
                        onAcknowledged: () => Effect.fail(ShardingError.ShardingErrorNoResultInProcessedMessageState()),
                        onProcessed: (state) =>
                          Option.isNone(state.result)
                            ? Effect.fail(ShardingError.ShardingErrorNoResultInProcessedMessageState())
                            : Effect.succeed(state.result.value)
                      }),
                      Effect.unified
                    )
                  ),
                  Effect.retry(pipe(
                    Schedule.fixed(100),
                    Schedule.whileInput((error: unknown) =>
                      ShardingError.isShardingErrorNoResultInProcessedMessageState(error)
                    )
                  )),
                  Effect.either,
                  Effect.map((res) => [pod, res] as const)
                ))
            )
          ),
          Effect.map((_) => HashMap.fromIterable(_))
        )
      }
    }

    return { broadcast, broadcastDiscard }
  }

  function registerEntity<Msg extends Message.Any, R>(
    entityType: RecipientType.EntityType<Msg>,
    behavior: RecipientBehaviour.RecipientBehaviour<R, Msg>,
    options?: RecipientBehaviour.EntityBehaviourOptions
  ): Effect.Effect<Exclude<R, RecipientBehaviourContext.RecipientBehaviourContext>, never, void> {
    return pipe(
      registerRecipient(entityType, behavior, options),
      Effect.zipRight(PubSub.publish(eventsHub, ShardingRegistrationEvent.EntityRegistered(entityType))),
      Effect.asUnit
    )
  }

  function registerTopic<Msg extends Message.Any, R>(
    topicType: RecipientType.TopicType<Msg>,
    behavior: RecipientBehaviour.RecipientBehaviour<R, Msg>,
    options?: RecipientBehaviour.EntityBehaviourOptions
  ): Effect.Effect<Exclude<R, RecipientBehaviourContext.RecipientBehaviourContext>, never, void> {
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

  function registerRecipient<Msg extends Message.Any, R>(
    recipientType: RecipientType.RecipientType<Msg>,
    behavior: RecipientBehaviour.RecipientBehaviour<R, Msg>,
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
    getAssignedShardIds,
    refreshAssignments,
    sendMessageToLocalEntityManagerWithoutRetries
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
    const entityManagers = yield* _(Ref.make(HashMap.empty<string, EntityManager.EntityManager<any>>()))
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
