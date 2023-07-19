import * as Equal from "@effect/data/Equal";
import { pipe } from "@effect/data/Function";
import * as HashMap from "@effect/data/HashMap";
import * as HashSet from "@effect/data/HashSet";
import * as Option from "@effect/data/Option";
import * as Effect from "@effect/io/Effect";
import * as Hub from "@effect/io/Hub";
import * as Ref from "@effect/io/Ref";
import * as Synchronized from "@effect/io/Ref/Synchronized";
import * as BinaryMessage from "@effect/shardcake/BinaryMessage";
import * as EntityManager from "@effect/shardcake/EntityManager";
import * as EntityState from "@effect/shardcake/EntityState";
import * as Message from "@effect/shardcake/Message";
import * as PodAddress from "@effect/shardcake/PodAddress";
import { Pods } from "@effect/shardcake/Pods";
import * as ReplyChannel from "@effect/shardcake/ReplyChannel";
import * as ReplyId from "@effect/shardcake/ReplyId";
import * as ShardingRegistrationEvent from "@effect/shardcake/ShardingRegistrationEvent";
import { ShardManagerClient } from "@effect/shardcake/ShardManagerClient";
import * as StreamMessage from "@effect/shardcake/StreamMessage";
import * as Stream from "@effect/stream/Stream";
import * as Duration from "@effect/data/Duration";
import { equals } from "@effect/data/Equal";
import * as List from "@effect/data/List";
// import { Cause } from "@effect/io/Cause"
import * as Fiber from "@effect/io/Fiber";
import * as Layer from "@effect/io/Layer";
import * as Schedule from "@effect/io/Schedule";
import * as RecipientType from "@effect/shardcake/RecipientType";
import * as Serialization from "@effect/shardcake/Serialization";
import { EntityTypeNotRegistered, isEntityNotManagedByThisPodError, isPodUnavailableError, MessageReturnedNoting, NotAMessageWithReplier, SendTimeoutException } from "@effect/shardcake/ShardError";
import * as ShardId from "@effect/shardcake/ShardId";
import * as ShardingConfig from "@effect/shardcake/ShardingConfig";
import * as Storage from "@effect/shardcake/Storage";
import { showHashSet } from "@effect/shardcake/utils";
import { Sharding } from "./Sharding";
/** @internal */
function make(address, config, shardAssignments, entityStates, singletons, replyChannels,
// reply channel for each pending reply,
// lastUnhealthyNodeReported: Ref.Ref<Date>,
isShuttingDownRef, shardManager, pods, storage, serialization, eventsHub) {
  function getShardId(recipientType, entityId) {
    return RecipientType.getShardId(entityId, config.numberOfShards);
  }
  const register = pipe(Effect.log(`Registering pod ${PodAddress.show(address)} to Shard Manager`, "Debug"), Effect.zipRight(pipe(isShuttingDownRef, Ref.set(false))), Effect.zipRight(shardManager.register(address)));
  const unregister = pipe(shardManager.getAssignments, Effect.matchCauseEffect({
    onFailure: Effect.logCause("Warning", {
      message: "Shard Manager not available. Can't unregister cleanly"
    }),
    onSuccess: () => pipe(Effect.log(`Stopping local entities`, "Debug"), Effect.zipRight(pipe(isShuttingDownRef, Ref.set(true))), Effect.zipRight(pipe(Ref.get(entityStates), Effect.flatMap(Effect.forEach(([name, entityState]) => pipe(entityState.entityManager.terminateAllEntities, Effect.catchAllCause(Effect.logCause("Error", {
      message: "Error during stop of entity " + name
    }))), {
      discard: true
    })))), Effect.zipRight(Effect.log(`Unregistering pod ${PodAddress.show(address)} to Shard Manager`, "Debug")), Effect.zipRight(shardManager.unregister(address)))
  }));
  const isSingletonNode = pipe(Ref.get(shardAssignments), Effect.map(_ => pipe(HashMap.get(_, ShardId.make(1)), Option.match({
    onNone: () => false,
    onSome: equals(address)
  }))));
  const startSingletonsIfNeeded = pipe(Synchronized.updateEffect(singletons, singletons => pipe(Effect.forEach(singletons, ([name, run, fa]) => Option.match(fa, {
    onNone: () => pipe(Effect.log("Starting singleton " + name, "Debug"), Effect.zipRight(Effect.map(Effect.forkDaemon(run), fiber => [name, run, Option.some(fiber)]))),
    onSome: _ => Effect.succeed([name, run, fa])
  })), Effect.map(List.fromIterable))), Effect.whenEffect(isSingletonNode), Effect.asUnit);
  const stopSingletonsIfNeeded = pipe(Synchronized.updateEffect(singletons, singletons => pipe(Effect.forEach(singletons, ([name, run, fa]) => Option.match(fa, {
    onNone: () => Effect.succeed([name, run, fa]),
    onSome: fiber => pipe(Effect.log("Stopping singleton " + name, "Debug"), Effect.zipRight(Effect.as(Fiber.interrupt(fiber), [name, run, Option.none()])))
  })), Effect.map(List.fromIterable))), Effect.unlessEffect(isSingletonNode), Effect.asUnit);
  function registerSingleton(name, run) {
    return pipe(Synchronized.update(singletons, list => List.prepend(list, [name, run, Option.none()])), Effect.zipRight(startSingletonsIfNeeded), Effect.zipRight(Hub.publish(eventsHub, ShardingRegistrationEvent.SingletonRegistered(name))));
  }
  const isShuttingDown = Ref.get(isShuttingDownRef);
  function assign(shards) {
    return pipe(Ref.update(shardAssignments, _ => HashSet.reduce(shards, _, (_, shardId) => HashMap.set(_, shardId, address))), Effect.zipRight(startSingletonsIfNeeded), Effect.zipLeft(Effect.log("Assigned shards: " + showHashSet(ShardId.show)(shards), "Debug")), Effect.unlessEffect(isShuttingDown), Effect.asUnit);
  }
  function unassign(shards) {
    return pipe(Ref.update(shardAssignments, _ => HashSet.reduce(shards, _, (_, shardId) => {
      const value = HashMap.get(_, shardId);
      if (Option.isSome(value) && equals(value.value, address)) {
        return HashMap.remove(_, shardId);
      }
      return _;
    })), Effect.zipRight(stopSingletonsIfNeeded), Effect.zipLeft(Effect.log("Unassigning shards: " + showHashSet(ShardId.show)(shards), "Debug")));
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
  const refreshAssignments = pipe(Stream.fromEffect(Effect.map(shardManager.getAssignments, _ => [_, true])), Stream.merge(pipe(storage.assignmentsStream, Stream.map(_ => [_, false]))), Stream.mapEffect(([assignmentsOpt, fromShardManager]) => updateAssignments(assignmentsOpt, fromShardManager)), Stream.runDrain, Effect.retry(Schedule.fixed(config.refreshAssignmentsRetryInterval)), Effect.interruptible, Effect.forkDaemon,
  // TODO: missing withFinalizer (fiber interrupt)
  Effect.asUnit);
  function sendToLocalEntitySingleReply(msg) {
    return Effect.gen(function* (_) {
      const replyChannel = yield* _(ReplyChannel.single());
      const schema = yield* _(sendToLocalEntity(msg, replyChannel));
      const res = yield* _(replyChannel.output);
      if (Option.isSome(res)) {
        if (Option.isNone(schema)) {
          return yield* _(Effect.die(NotAMessageWithReplier(msg)));
        }
        return Option.some(yield* _(serialization.encode(res.value, schema.value)));
      }
      return Option.none();
    });
  }
  function sendToLocalEntityStreamingReply(msg) {
    return pipe(Effect.gen(function* (_) {
      const replyChannel = yield* _(ReplyChannel.stream());
      const schema = yield* _(sendToLocalEntity(msg, replyChannel));
      return pipe(replyChannel.output, Stream.mapEffect(value => {
        if (Option.isNone(schema)) {
          return Effect.die(NotAMessageWithReplier(msg));
        }
        return serialization.encode(value, schema.value);
      }));
    }), Stream.fromEffect, Stream.flatten);
  }
  function sendToLocalEntity(msg, replyChannel) {
    return pipe(Ref.get(entityStates), Effect.flatMap(states => {
      const a = HashMap.get(states, msg.entityType);
      if (Option.isSome(a)) {
        return a.value.processBinary(msg, replyChannel);
      } else {
        return Effect.fail(EntityTypeNotRegistered(msg.entityType, address));
      }
    }));
  }
  function initReply(id, replyChannel) {
    return pipe(replyChannels, Synchronized.update(HashMap.set(id, replyChannel)), Effect.zipLeft(pipe(replyChannel.await, Effect.ensuring(Synchronized.update(replyChannels, HashMap.remove(id))), Effect.forkDaemon)));
  }
  function reply(reply, replier) {
    return Synchronized.updateEffect(replyChannels, repliers => pipe(Effect.suspend(() => {
      const replyChannel = HashMap.get(repliers, replier.id);
      if (Option.isSome(replyChannel)) {
        return replyChannel.value.replySingle(reply);
      }
      return Effect.unit;
    }), Effect.as(pipe(repliers, HashMap.remove(replier.id)))));
  }
  function replyStream(replies, replier) {
    return Synchronized.updateEffect(replyChannels, repliers => pipe(Effect.suspend(() => {
      const replyChannel = HashMap.get(repliers, replier.id);
      if (Option.isSome(replyChannel)) {
        return replyChannel.value.replyStream(replies);
      }
      return Effect.unit;
    }), Effect.as(pipe(repliers, HashMap.remove(replier.id)))));
  }
  function sendToPod(recipientTypeName, entityId, msg, msgSchema, pod, replyId, replyChannel) {
    if (config.simulateRemotePods && equals(pod, address)) {
      return pipe(serialization.encode(msg, msgSchema), Effect.flatMap(bytes => sendToLocalEntity(BinaryMessage.make(entityId, recipientTypeName, bytes, replyId), replyChannel)), Effect.asUnit);
    } else if (equals(pod, address)) {
      // if pod = self, shortcut and send directly without serialization
      return pipe(Ref.get(entityStates), Effect.flatMap(_ => pipe(HashMap.get(_, recipientTypeName), Option.match({
        onNone: () => Effect.fail(EntityTypeNotRegistered(recipientTypeName, pod)),
        onSome: state => pipe(state.entityManager.send(entityId, msg, replyId, replyChannel))
      }))));
    } else {
      return pipe(serialization.encode(msg, msgSchema), Effect.flatMap(bytes => {
        const errorHandling = _ => Effect.die("Not handled yet");
        const binaryMessage = BinaryMessage.make(entityId, recipientTypeName, bytes, replyId);
        if (ReplyChannel.isReplyChannelFromDeferred(replyChannel)) {
          return pipe(pods.sendMessage(pod, binaryMessage), Effect.tapError(errorHandling), Effect.flatMap(Option.match({
            onNone: () => replyChannel.end,
            onSome: bytes => {
              if (Message.isMessage(msg)) {
                return pipe(serialization.decode(bytes, msg.replier.schema), Effect.flatMap(replyChannel.replySingle));
              }
              return Effect.die(NotAMessageWithReplier(msg));
            }
          })));
        }
        if (ReplyChannel.isReplyChannelFromQueue(replyChannel)) {
          return pipe(replyChannel.replyStream(pipe(pods.sendMessageStreaming(pod, binaryMessage), Stream.tapError(errorHandling), Stream.mapEffect(bytes => {
            if (StreamMessage.isStreamMessage(msg)) {
              return serialization.decode(bytes, msg.replier.schema);
            }
            return Effect.die(NotAMessageWithReplier(msg));
          }))));
        }
        return Effect.dieMessage("got unknown replyChannel type");
      }));
    }
  }
  function messenger(entityType, sendTimeout = Option.none()) {
    const timeout = pipe(sendTimeout, Option.getOrElse(() => config.sendTimeout));
    function sendDiscard(entityId) {
      return msg => pipe(sendMessage(entityId, msg, Option.none()), Effect.timeout(timeout), Effect.asUnit);
    }
    function send(entityId) {
      return fn => {
        return pipe(ReplyId.makeEffect, Effect.flatMap(replyId => {
          const body = fn(replyId);
          return pipe(sendMessage(entityId, body, Option.some(replyId)), Effect.flatMap(_ => {
            if (Option.isSome(_)) return Effect.succeed(_.value);
            return Effect.fail(MessageReturnedNoting(entityId, body));
          }), Effect.timeoutFail({
            onTimeout: () => SendTimeoutException(entityType, entityId, body),
            duration: timeout
          }), Effect.interruptible);
        }));
      };
    }
    function sendStream(entityId) {
      return fn => {
        return pipe(ReplyId.makeEffect, Effect.flatMap(replyId => {
          const body = fn(replyId);
          return sendMessageStreaming(entityId, body, Option.some(replyId));
        }));
      };
    }
    function sendMessage(entityId, msg, replyId) {
      return Effect.gen(function* (_) {
        const replyChannel = yield* _(ReplyChannel.single());
        yield* _(sendMessageGeneric(entityId, msg, replyId, replyChannel));
        return yield* _(replyChannel.output);
      });
    }
    function sendMessageStreaming(entityId, msg, replyId) {
      return Effect.gen(function* (_) {
        const replyChannel = yield* _(ReplyChannel.stream());
        yield* _(sendMessageGeneric(entityId, msg, replyId, replyChannel));
        return replyChannel.output;
      });
    }
    function sendMessageGeneric(entityId, msg, replyId, replyChannel) {
      const shardId = getShardId(entityType, entityId);
      const trySend = pipe(Effect.Do, Effect.bind("shards", () => Ref.get(shardAssignments)), Effect.let("pod", ({
        shards
      }) => HashMap.get(shards, shardId)), Effect.bind("response", ({
        pod
      }) => {
        if (Option.isSome(pod)) {
          return pipe(sendToPod(entityType.name, entityId, msg, entityType.schema, pod.value, replyId, replyChannel), Effect.catchSome(_ => {
            if (isEntityNotManagedByThisPodError(_) || isPodUnavailableError(_)) {
              return pipe(Effect.sleep(Duration.millis(200)), Effect.zipRight(trySend), Option.some);
            }
            return Option.none();
          }), Effect.onError(replyChannel.fail));
        }
        return pipe(Effect.sleep(Duration.millis(100)), Effect.zipRight(trySend));
      }), Effect.asUnit);
      return trySend;
    }
    return {
      sendDiscard,
      send,
      sendStream
    };
  }
  function broadcaster(topicType, sendTimeout = Option.none()) {
    const timeout = pipe(sendTimeout, Option.getOrElse(() => config.sendTimeout));
    function sendMessage(topic, body, replyId) {
      return pipe(Effect.Do, Effect.bind("pods", () => getPods), Effect.bind("response", ({
        pods
      }) => Effect.forEach(pods, pod => {
        const trySend = Effect.gen(function* (_) {
          const replyChannel = yield* _(ReplyChannel.single());
          yield* _(pipe(sendToPod(topicType.name, topic, body, topicType.schema, pod, replyId, replyChannel), Effect.catchSome(_ => {
            if (isPodUnavailableError(_)) {
              return pipe(Effect.sleep(Duration.millis(200)), Effect.zipRight(trySend), Option.some);
            }
            return Option.none();
          }), Effect.onError(replyChannel.fail)));
          return yield* _(replyChannel.output);
        });
        return pipe(trySend, Effect.flatMap(_ => {
          if (Option.isSome(_)) return Effect.succeed(_.value);
          return Effect.fail(MessageReturnedNoting(topic, body));
        }), Effect.timeoutFail({
          onTimeout: () => SendTimeoutException(topicType, topic, body),
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
      return fn => {
        return pipe(ReplyId.makeEffect, Effect.flatMap(replyId => {
          const body = fn(replyId);
          return pipe(sendMessage(topic, body, Option.some(replyId)), Effect.interruptible);
        }));
      };
    }
    return {
      broadcast,
      broadcastDiscard
    };
  }
  function registerEntity(entityType, behavior, terminateMessage = () => Option.none(), entityMaxIdleTime = Option.none()) {
    return pipe(registerRecipient(entityType, behavior, terminateMessage, entityMaxIdleTime), Effect.zipRight(Hub.publish(eventsHub, ShardingRegistrationEvent.EntityRegistered(entityType))), Effect.asUnit);
  }
  function registerTopic(topicType, behavior, terminateMessage = () => Option.none()) {
    return pipe(registerRecipient(topicType, behavior, terminateMessage, Option.none()), Effect.zipRight(Hub.publish(eventsHub, ShardingRegistrationEvent.TopicRegistered(topicType))), Effect.asUnit);
  }
  const getShardingRegistrationEvents = Stream.fromHub(eventsHub);
  function registerRecipient(recipientType, behavior, terminateMessage = () => Option.none(), entityMaxIdleTime = Option.none()) {
    return Effect.gen(function* ($) {
      const entityManager = yield* $(EntityManager.make(recipientType, behavior, terminateMessage, self, config, entityMaxIdleTime));
      const processBinary = (msg, replyChannel) => pipe(serialization.decode(msg.body, recipientType.schema), Effect.flatMap(_ => pipe(entityManager.send(msg.entityId, _, msg.replyId, replyChannel), Effect.as(Message.isMessage(_) ? Option.some(_.replier.schema) : StreamMessage.isStreamMessage(_) ? Option.some(_.replier.schema) : Option.none()))), Effect.catchAllCause(_ => Effect.as(replyChannel.fail(_), Option.none())));
      yield* $(pipe(entityStates, Ref.update(HashMap.set(recipientType.name, EntityState.make(entityManager, processBinary)))));
    });
  }
  const registerScoped = Effect.acquireRelease(register, _ => Effect.orDie(unregister));
  const self = {
    getShardId,
    register,
    unregister,
    reply,
    messenger,
    broadcaster,
    isEntityOnLocalShards,
    isShuttingDown,
    initReply,
    registerSingleton,
    registerScoped,
    registerEntity,
    registerTopic,
    getShardingRegistrationEvents,
    refreshAssignments,
    assign,
    unassign,
    sendToLocalEntity,
    sendToLocalEntitySingleReply,
    sendToLocalEntityStreamingReply,
    getPods,
    replyStream
  };
  return self;
}
/**
 * @since 1.0.0
 * @category layers
 */
export const live = /*#__PURE__*/Layer.scoped(Sharding, /*#__PURE__*/pipe(Effect.Do, /*#__PURE__*/Effect.bind("config", () => ShardingConfig.ShardingConfig), /*#__PURE__*/Effect.bind("pods", () => Pods), /*#__PURE__*/Effect.bind("shardManager", () => ShardManagerClient), /*#__PURE__*/Effect.bind("storage", () => Storage.Storage), /*#__PURE__*/Effect.bind("serialization", () => Serialization.Serialization), /*#__PURE__*/Effect.bind("shardsCache", () => Ref.make(HashMap.empty())), /*#__PURE__*/Effect.bind("entityStates", () => Ref.make(HashMap.empty())), /*#__PURE__*/Effect.bind("singletons", _ => pipe(Synchronized.make(List.nil())
/*
TODO(Mattia): add finalizer
Effect.flatMap((_) =>
  Effect.ensuring(Synchronized.get(_, (singletons) =>
    Effect.forEach(singletons, ([_, __, fiber]) =>
      Option.isSome(fiber) ? Fiber.interrupt(fiber) : Effect.unit())))
)*/)), /*#__PURE__*/Effect.bind("shuttingDown", () => Ref.make(false)), /*#__PURE__*/Effect.bind("replyChannels", () => Synchronized.make(HashMap.empty())), /*#__PURE__*/Effect.bind("eventsHub", () => Hub.unbounded()), /*#__PURE__*/Effect.let("sharding", _ => make(PodAddress.make(_.config.selfHost, _.config.shardingPort), _.config, _.shardsCache, _.entityStates, _.singletons, _.replyChannels, _.shuttingDown, _.shardManager, _.pods, _.storage, _.serialization, _.eventsHub)), /*#__PURE__*/Effect.tap(_ => _.sharding.refreshAssignments), /*#__PURE__*/Effect.map(_ => _.sharding)));
//# sourceMappingURL=ShardingImpl.mjs.map