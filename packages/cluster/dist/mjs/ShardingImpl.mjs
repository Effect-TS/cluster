import * as EntityManager from "@effect/cluster/EntityManager";
import * as Message from "@effect/cluster/Message";
import * as PodAddress from "@effect/cluster/PodAddress";
import * as Pods from "@effect/cluster/Pods";
import * as RecipientType from "@effect/cluster/RecipientType";
import * as Serialization from "@effect/cluster/Serialization";
import * as SerializedEnvelope from "@effect/cluster/SerializedEnvelope";
import * as ShardId from "@effect/cluster/ShardId";
import * as Sharding from "@effect/cluster/Sharding";
import * as ShardingConfig from "@effect/cluster/ShardingConfig";
import * as ShardingError from "@effect/cluster/ShardingError";
import * as ShardingRegistrationEvent from "@effect/cluster/ShardingRegistrationEvent";
import * as ShardManagerClient from "@effect/cluster/ShardManagerClient";
import * as Storage from "@effect/cluster/Storage";
import { MessageReturnedNotingDefect, NotAMessageWithReplierDefect, showHashSet } from "@effect/cluster/utils";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Equal from "effect/Equal";
import { equals } from "effect/Equal";
import * as Fiber from "effect/Fiber";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Layer from "effect/Layer";
import * as List from "effect/List";
import * as Option from "effect/Option";
import * as PubSub from "effect/PubSub";
import * as Ref from "effect/Ref";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import * as Synchronized from "effect/SynchronizedRef";
/** @internal */
function make(layerScope, address, config, shardAssignments, entityManagers, singletons,
// lastUnhealthyNodeReported: Ref.Ref<Date>,
isShuttingDownRef, shardManager, pods, storage, serialization, eventsHub) {
  function decodeRequest(envelope) {
    return pipe(Ref.get(entityManagers), Effect.map(HashMap.get(envelope.entityType)), Effect.flatMap(_ => Effect.unified(Option.match(_, {
      onNone: () => Effect.fail(ShardingError.ShardingErrorEntityTypeNotRegistered(envelope.entityType, address)),
      onSome: entityManager => pipe(serialization.decode(entityManager.recipientType.schema, envelope.body), Effect.map(request => [request, entityManager]))
    }))));
  }
  function encodeReply(request, reply) {
    if (Option.isNone(reply)) {
      return Effect.succeed(Option.none());
    }
    if (!Message.isMessage(request)) {
      return Effect.die(NotAMessageWithReplierDefect(request));
    }
    return pipe(serialization.encode(request.replier.schema, reply), Effect.map(Option.some));
  }
  function decodeReply(request, body) {
    if (Option.isNone(body)) {
      return Effect.succeed(Option.none());
    }
    if (!Message.isMessage(request)) {
      return Effect.die(NotAMessageWithReplierDefect(request));
    }
    return pipe(serialization.decode(request.replier.schema, body.value), Effect.map(Option.some));
  }
  function getShardId(recipientType, entityId) {
    return RecipientType.getShardId(entityId, config.numberOfShards);
  }
  const register = pipe(Effect.logDebug(`Registering pod ${PodAddress.show(address)} to Shard Manager`), Effect.zipRight(pipe(isShuttingDownRef, Ref.set(false))), Effect.zipRight(shardManager.register(address)));
  const unregister = pipe(shardManager.getAssignments, Effect.matchCauseEffect({
    onFailure: _ => Effect.logWarning("Shard Manager not available. Can't unregister cleanly", _),
    onSuccess: () => pipe(Effect.logDebug(`Stopping local entities`), Effect.zipRight(pipe(isShuttingDownRef, Ref.set(true))), Effect.zipRight(pipe(Ref.get(entityManagers), Effect.flatMap(Effect.forEach(([name, entityManager]) => pipe(entityManager.terminateAllEntities, Effect.catchAllCause(_ => Effect.logError("Error during stop of entity " + name, _))), {
      discard: true
    })))), Effect.zipRight(Effect.logDebug(`Unregistering pod ${PodAddress.show(address)} to Shard Manager`)), Effect.zipRight(shardManager.unregister(address)))
  }));
  const isSingletonNode = pipe(Ref.get(shardAssignments), Effect.map(_ => pipe(HashMap.get(_, ShardId.make(1)), Option.match({
    onNone: () => false,
    onSome: equals(address)
  }))));
  const startSingletonsIfNeeded = pipe(Synchronized.updateEffect(singletons, singletons => pipe(Effect.forEach(singletons, ([name, run, maybeExecutionFiber]) => Option.match(maybeExecutionFiber, {
    onNone: () => pipe(Effect.logDebug("Starting singleton " + name), Effect.zipRight(Effect.map(Effect.forkIn(layerScope)(run), fiber => [name, run, Option.some(fiber)]))),
    onSome: _ => Effect.succeed([name, run, maybeExecutionFiber])
  })), Effect.map(List.fromIterable))), Effect.whenEffect(isSingletonNode), Effect.asUnit);
  const stopSingletonsIfNeeded = pipe(Synchronized.updateEffect(singletons, singletons => pipe(Effect.forEach(singletons, ([name, run, maybeExecutionFiber]) => Option.match(maybeExecutionFiber, {
    onNone: () => Effect.succeed([name, run, maybeExecutionFiber]),
    onSome: fiber => pipe(Effect.logDebug("Stopping singleton " + name), Effect.zipRight(Effect.as(Fiber.interrupt(fiber), [name, run, Option.none()])))
  })), Effect.map(List.fromIterable))), Effect.unlessEffect(isSingletonNode), Effect.asUnit);
  function registerSingleton(name, run) {
    return pipe(Effect.context(), Effect.flatMap(context => Synchronized.update(singletons, list => List.prepend(list, [name, Effect.provide(run, context), Option.none()]))), Effect.zipLeft(startSingletonsIfNeeded), Effect.zipRight(PubSub.publish(eventsHub, ShardingRegistrationEvent.SingletonRegistered(name))));
  }
  const isShuttingDown = Ref.get(isShuttingDownRef);
  function assign(shards) {
    return pipe(Ref.update(shardAssignments, _ => HashSet.reduce(shards, _, (_, shardId) => HashMap.set(_, shardId, address))), Effect.zipRight(startSingletonsIfNeeded), Effect.zipLeft(Effect.logDebug("Assigned shards: " + showHashSet(ShardId.show)(shards))), Effect.unlessEffect(isShuttingDown), Effect.asUnit);
  }
  function unassign(shards) {
    return pipe(Ref.update(shardAssignments, _ => HashSet.reduce(shards, _, (_, shardId) => {
      const value = HashMap.get(_, shardId);
      if (Option.isSome(value) && equals(value.value, address)) {
        return HashMap.remove(_, shardId);
      }
      return _;
    })), Effect.zipRight(stopSingletonsIfNeeded), Effect.zipLeft(Effect.logDebug("Unassigning shards: " + showHashSet(ShardId.show)(shards))));
  }
  function isEntityOnLocalShards(recipientType, entityId) {
    return pipe(Effect.Do, Effect.bind("shards", () => Ref.get(shardAssignments)), Effect.let("shardId", () => getShardId(recipientType, entityId)), Effect.let("pod", ({
      shardId,
      shards
    }) => pipe(shards, HashMap.get(shardId))), Effect.map(_ => Option.isSome(_.pod) && equals(_.pod.value, address)));
  }
  const getPods = pipe(Ref.get(shardAssignments), Effect.map(_ => HashSet.fromIterable(HashMap.values(_))));
  function updateAssignments(assignmentsOpt, fromShardManager) {
    const assignments = HashMap.map(assignmentsOpt, (v, _) => Option.getOrElse(v, () => address));
    if (fromShardManager) {
      return Ref.update(shardAssignments, map => HashMap.isEmpty(map) ? assignments : map);
    }
    return Ref.update(shardAssignments, map => {
      // we keep self assignments (we don't override them with the new assignments
      // because only the Shard Manager is able to change assignments of the current node, via assign/unassign
      return HashMap.union(pipe(assignments, HashMap.filter((pod, _) => !Equal.equals(pod, address))), pipe(map, HashMap.filter((pod, _) => Equal.equals(pod, address))));
    });
  }
  const refreshAssignments = pipe(Stream.fromEffect(Effect.map(shardManager.getAssignments, _ => [_, true])), Stream.merge(pipe(storage.assignmentsStream, Stream.map(_ => [_, false]))), Stream.mapEffect(([assignmentsOpt, fromShardManager]) => updateAssignments(assignmentsOpt, fromShardManager)), Stream.tap(() => startSingletonsIfNeeded), Stream.runDrain, Effect.retry(Schedule.fixed(config.refreshAssignmentsRetryInterval)), Effect.interruptible, Effect.forkScoped, Effect.asUnit);
  function sendToLocalEntity(envelope) {
    return Effect.gen(function* (_) {
      const [request, entityManager] = yield* _(decodeRequest(envelope));
      return yield* _(entityManager.send(envelope.entityId, request, envelope.replyId), Effect.flatMap(_ => encodeReply(request, _)));
    });
  }
  function sendToPod(recipientTypeName, entityId, msg, msgSchema, pod, replyId) {
    if (config.simulateRemotePods && equals(pod, address)) {
      return pipe(serialization.encode(msgSchema, msg), Effect.flatMap(bytes => pipe(decodeRequest(SerializedEnvelope.make(entityId, recipientTypeName, bytes, replyId)), Effect.flatMap(([request, entityManager]) => entityManager.send(entityId, request, replyId)))));
    } else if (equals(pod, address)) {
      // if pod = self, shortcut and send directly without serialization
      return pipe(Ref.get(entityManagers), Effect.flatMap(_ => pipe(HashMap.get(_, recipientTypeName), Option.match({
        onNone: () => Effect.fail(ShardingError.ShardingErrorEntityTypeNotRegistered(recipientTypeName, pod)),
        onSome: entityManager => entityManager.send(entityId, msg, replyId)
      }))), Effect.unified);
    } else {
      return pipe(serialization.encode(msgSchema, msg), Effect.flatMap(bytes => {
        const errorHandling = _ => Effect.die("Not handled yet");
        const envelope = SerializedEnvelope.make(entityId, recipientTypeName, bytes, replyId);
        return pipe(pods.sendMessage(pod, envelope), Effect.tapError(errorHandling), Effect.flatMap(_ => decodeReply(msg, _)), Effect.unified);
      }));
    }
  }
  function messenger(entityType, sendTimeout = Option.none()) {
    const timeout = pipe(sendTimeout, Option.getOrElse(() => config.sendTimeout));
    function sendDiscard(entityId) {
      return msg => pipe(sendMessage(entityId, msg, Option.none()), Effect.timeout(timeout), Effect.asUnit);
    }
    function send(entityId) {
      return msg => {
        return pipe(sendMessage(entityId, msg, Option.some(msg.replier.id)), Effect.flatMap(_ => {
          if (Option.isSome(_)) return Effect.succeed(_.value);
          return Effect.die(MessageReturnedNotingDefect(entityId));
        }), Effect.timeoutFail({
          onTimeout: ShardingError.ShardingErrorSendTimeout,
          duration: timeout
        }), Effect.interruptible);
      };
    }
    function sendMessage(entityId, msg, replyId) {
      const shardId = getShardId(entityType, entityId);
      const trySend = pipe(Effect.Do, Effect.bind("shards", () => Ref.get(shardAssignments)), Effect.let("pod", ({
        shards
      }) => HashMap.get(shards, shardId)), Effect.bind("response", ({
        pod
      }) => {
        if (Option.isSome(pod)) {
          return pipe(sendToPod(entityType.name, entityId, msg, entityType.schema, pod.value, replyId), Effect.catchSome(_ => {
            if (ShardingError.isShardingErrorEntityNotManagedByThisPod(_) || ShardingError.isShardingErrorPodUnavailable(_)) {
              return pipe(Effect.sleep(Duration.millis(200)), Effect.zipRight(trySend), Option.some);
            }
            return Option.none();
          }));
        }
        return pipe(Effect.sleep(Duration.millis(100)), Effect.zipRight(trySend));
      }), Effect.map(_ => _.response));
      return trySend;
    }
    return {
      sendDiscard,
      send
    };
  }
  function broadcaster(topicType, sendTimeout = Option.none()) {
    const timeout = pipe(sendTimeout, Option.getOrElse(() => config.sendTimeout));
    function sendMessage(topic, body, replyId) {
      return pipe(Effect.Do, Effect.bind("pods", () => getPods), Effect.bind("response", ({
        pods
      }) => Effect.forEach(pods, pod => {
        const trySend = pipe(sendToPod(topicType.name, topic, body, topicType.schema, pod, replyId), Effect.catchSome(_ => {
          if (ShardingError.isShardingErrorPodUnavailable(_)) {
            return pipe(Effect.sleep(Duration.millis(200)), Effect.zipRight(trySend), Option.some);
          }
          return Option.none();
        }));
        return pipe(trySend, Effect.flatMap(_ => {
          if (Option.isSome(_)) return Effect.succeed(_.value);
          return Effect.die(MessageReturnedNotingDefect(topic));
        }), Effect.timeoutFail({
          onTimeout: ShardingError.ShardingErrorSendTimeout,
          duration: timeout
        }), Effect.either, Effect.map(res => [pod, res]));
      }, {
        concurrency: "inherit"
      })), Effect.map(_ => _.response), Effect.map(HashMap.fromIterable));
    }
    function broadcastDiscard(topic) {
      return msg => pipe(sendMessage(topic, msg, Option.none()), Effect.timeout(timeout), Effect.asUnit);
    }
    function broadcast(topic) {
      return msg => {
        return pipe(sendMessage(topic, msg, Option.some(msg.replier.id)), Effect.interruptible);
      };
    }
    return {
      broadcast,
      broadcastDiscard
    };
  }
  function registerEntity(entityType, behavior, options) {
    return pipe(registerRecipient(entityType, behavior, options), Effect.zipRight(PubSub.publish(eventsHub, ShardingRegistrationEvent.EntityRegistered(entityType))), Effect.asUnit);
  }
  function registerTopic(topicType, behavior, options) {
    return pipe(registerRecipient(topicType, behavior, options), Effect.zipRight(PubSub.publish(eventsHub, ShardingRegistrationEvent.TopicRegistered(topicType))), Effect.asUnit);
  }
  const getShardingRegistrationEvents = Stream.fromPubSub(eventsHub);
  function registerRecipient(recipientType, behavior, options) {
    return Effect.gen(function* ($) {
      const entityManager = yield* $(EntityManager.make(recipientType, behavior, self, config, options));
      yield* $(Ref.update(entityManagers, HashMap.set(recipientType.name, entityManager)));
    });
  }
  const registerScoped = Effect.acquireRelease(register, _ => Effect.orDie(unregister));
  const self = {
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
  };
  return self;
}
/**
 * @since 1.0.0
 * @category layers
 */
export const live = /*#__PURE__*/Layer.scoped(Sharding.Sharding, /*#__PURE__*/Effect.gen(function* (_) {
  const config = yield* _(ShardingConfig.ShardingConfig);
  const pods = yield* _(Pods.Pods);
  const shardManager = yield* _(ShardManagerClient.ShardManagerClient);
  const storage = yield* _(Storage.Storage);
  const serialization = yield* _(Serialization.Serialization);
  const shardsCache = yield* _(Ref.make(HashMap.empty()));
  const entityManagers = yield* _(Ref.make(HashMap.empty()));
  const shuttingDown = yield* _(Ref.make(false));
  const eventsHub = yield* _(PubSub.unbounded());
  const singletons = yield* _(Synchronized.make(List.nil()));
  const layerScope = yield* _(Effect.scope);
  yield* _(Effect.addFinalizer(() => pipe(Synchronized.get(singletons), Effect.flatMap(Effect.forEach(([_, __, fa]) => Option.isSome(fa) ? Fiber.interrupt(fa.value) : Effect.unit)))));
  const sharding = make(layerScope, PodAddress.make(config.selfHost, config.shardingPort), config, shardsCache, entityManagers, singletons, shuttingDown, shardManager, pods, storage, serialization, eventsHub);
  yield* _(sharding.refreshAssignments);
  return sharding;
}));
//# sourceMappingURL=ShardingImpl.mjs.map