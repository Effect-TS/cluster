"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.live = void 0;
var Equal = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Equal"));
var _Function = /*#__PURE__*/require("@effect/data/Function");
var HashMap = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashMap"));
var HashSet = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashSet"));
var Option = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Option"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var Hub = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Hub"));
var Ref = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Ref"));
var Synchronized = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Ref/Synchronized"));
var BinaryMessage = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/BinaryMessage"));
var EntityManager = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/EntityManager"));
var EntityState = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/EntityState"));
var Message = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/Message"));
var PodAddress = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/PodAddress"));
var _Pods = /*#__PURE__*/require("@effect/shardcake/Pods");
var ReplyChannel = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ReplyChannel"));
var ReplyId = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ReplyId"));
var ShardingRegistrationEvent = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ShardingRegistrationEvent"));
var _ShardManagerClient = /*#__PURE__*/require("@effect/shardcake/ShardManagerClient");
var StreamMessage = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/StreamMessage"));
var Stream = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/stream/Stream"));
var Duration = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Duration"));
var List = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/List"));
var Fiber = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Fiber"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Layer"));
var Schedule = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Schedule"));
var RecipientType = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/RecipientType"));
var Serialization = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/Serialization"));
var _ShardError = /*#__PURE__*/require("@effect/shardcake/ShardError");
var ShardId = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ShardId"));
var ShardingConfig = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ShardingConfig"));
var Storage = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/Storage"));
var _utils = /*#__PURE__*/require("@effect/shardcake/utils");
var _Sharding = /*#__PURE__*/require("./Sharding");
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
// import { Cause } from "@effect/io/Cause"

/** @internal */
function make(address, config, shardAssignments, entityStates, singletons, replyChannels,
// reply channel for each pending reply,
// lastUnhealthyNodeReported: Ref.Ref<Date>,
isShuttingDownRef, shardManager, pods, storage, serialization, eventsHub) {
  function getShardId(recipientType, entityId) {
    return RecipientType.getShardId(entityId, config.numberOfShards);
  }
  const register = (0, _Function.pipe)(Effect.log(`Registering pod ${PodAddress.show(address)} to Shard Manager`, "Debug"), Effect.zipRight((0, _Function.pipe)(isShuttingDownRef, Ref.set(false))), Effect.zipRight(shardManager.register(address)));
  const unregister = (0, _Function.pipe)(shardManager.getAssignments, Effect.matchCauseEffect({
    onFailure: Effect.logCause("Warning", {
      message: "Shard Manager not available. Can't unregister cleanly"
    }),
    onSuccess: () => (0, _Function.pipe)(Effect.log(`Stopping local entities`, "Debug"), Effect.zipRight((0, _Function.pipe)(isShuttingDownRef, Ref.set(true))), Effect.zipRight((0, _Function.pipe)(Ref.get(entityStates), Effect.flatMap(Effect.forEach(([name, entityState]) => (0, _Function.pipe)(entityState.entityManager.terminateAllEntities, Effect.catchAllCause(Effect.logCause("Error", {
      message: "Error during stop of entity " + name
    }))), {
      discard: true
    })))), Effect.zipRight(Effect.log(`Unregistering pod ${PodAddress.show(address)} to Shard Manager`, "Debug")), Effect.zipRight(shardManager.unregister(address)))
  }));
  const isSingletonNode = (0, _Function.pipe)(Ref.get(shardAssignments), Effect.map(_ => (0, _Function.pipe)(HashMap.get(_, ShardId.make(1)), Option.match({
    onNone: () => false,
    onSome: (0, Equal.equals)(address)
  }))));
  const startSingletonsIfNeeded = (0, _Function.pipe)(Synchronized.updateEffect(singletons, singletons => (0, _Function.pipe)(Effect.forEach(singletons, ([name, run, fa]) => Option.match(fa, {
    onNone: () => (0, _Function.pipe)(Effect.log("Starting singleton " + name, "Debug"), Effect.zipRight(Effect.map(Effect.forkDaemon(run), fiber => [name, run, Option.some(fiber)]))),
    onSome: _ => Effect.succeed([name, run, fa])
  })), Effect.map(List.fromIterable))), Effect.whenEffect(isSingletonNode), Effect.asUnit);
  const stopSingletonsIfNeeded = (0, _Function.pipe)(Synchronized.updateEffect(singletons, singletons => (0, _Function.pipe)(Effect.forEach(singletons, ([name, run, fa]) => Option.match(fa, {
    onNone: () => Effect.succeed([name, run, fa]),
    onSome: fiber => (0, _Function.pipe)(Effect.log("Stopping singleton " + name, "Debug"), Effect.zipRight(Effect.as(Fiber.interrupt(fiber), [name, run, Option.none()])))
  })), Effect.map(List.fromIterable))), Effect.unlessEffect(isSingletonNode), Effect.asUnit);
  function registerSingleton(name, run) {
    return (0, _Function.pipe)(Synchronized.update(singletons, list => List.prepend(list, [name, run, Option.none()])), Effect.zipRight(startSingletonsIfNeeded), Effect.zipRight(Hub.publish(eventsHub, ShardingRegistrationEvent.SingletonRegistered(name))));
  }
  const isShuttingDown = Ref.get(isShuttingDownRef);
  function assign(shards) {
    return (0, _Function.pipe)(Ref.update(shardAssignments, _ => HashSet.reduce(shards, _, (_, shardId) => HashMap.set(_, shardId, address))), Effect.zipRight(startSingletonsIfNeeded), Effect.zipLeft(Effect.log("Assigned shards: " + (0, _utils.showHashSet)(ShardId.show)(shards), "Debug")), Effect.unlessEffect(isShuttingDown), Effect.asUnit);
  }
  function unassign(shards) {
    return (0, _Function.pipe)(Ref.update(shardAssignments, _ => HashSet.reduce(shards, _, (_, shardId) => {
      const value = HashMap.get(_, shardId);
      if (Option.isSome(value) && (0, Equal.equals)(value.value, address)) {
        return HashMap.remove(_, shardId);
      }
      return _;
    })), Effect.zipRight(stopSingletonsIfNeeded), Effect.zipLeft(Effect.log("Unassigning shards: " + (0, _utils.showHashSet)(ShardId.show)(shards), "Debug")));
  }
  function isEntityOnLocalShards(recipientType, entityId) {
    return (0, _Function.pipe)(Effect.Do, Effect.bind("shards", () => Ref.get(shardAssignments)), Effect.let("shardId", () => getShardId(recipientType, entityId)), Effect.let("pod", ({
      shardId,
      shards
    }) => (0, _Function.pipe)(shards, HashMap.get(shardId))), Effect.map(_ => Option.isSome(_.pod) && (0, Equal.equals)(_.pod.value, address)));
  }
  const getPods = (0, _Function.pipe)(Ref.get(shardAssignments), Effect.map(_ => HashSet.fromIterable(HashMap.values(_))));
  function updateAssignments(assignmentsOpt, fromShardManager) {
    const assignments = HashMap.map(assignmentsOpt, (v, _) => Option.getOrElse(v, () => address));
    if (fromShardManager) {
      return Ref.update(shardAssignments, map => HashMap.isEmpty(map) ? assignments : map);
    }
    return Ref.update(shardAssignments, map => {
      // we keep self assignments (we don't override them with the new assignments
      // because only the Shard Manager is able to change assignments of the current node, via assign/unassign
      return HashMap.union((0, _Function.pipe)(assignments, HashMap.filter((pod, _) => !Equal.equals(pod, address))), (0, _Function.pipe)(map, HashMap.filter((pod, _) => Equal.equals(pod, address))));
    });
  }
  const refreshAssignments = (0, _Function.pipe)(Stream.fromEffect(Effect.map(shardManager.getAssignments, _ => [_, true])), Stream.merge((0, _Function.pipe)(storage.assignmentsStream, Stream.map(_ => [_, false]))), Stream.mapEffect(([assignmentsOpt, fromShardManager]) => updateAssignments(assignmentsOpt, fromShardManager)), Stream.runDrain, Effect.retry(Schedule.fixed(config.refreshAssignmentsRetryInterval)), Effect.interruptible, Effect.forkDaemon,
  // TODO: missing withFinalizer (fiber interrupt)
  Effect.asUnit);
  function sendToLocalEntitySingleReply(msg) {
    return Effect.gen(function* (_) {
      const replyChannel = yield* _(ReplyChannel.single());
      const schema = yield* _(sendToLocalEntity(msg, replyChannel));
      const res = yield* _(replyChannel.output);
      if (Option.isSome(res)) {
        if (Option.isNone(schema)) {
          return yield* _(Effect.die((0, _ShardError.NotAMessageWithReplier)(msg)));
        }
        return Option.some(yield* _(serialization.encode(res.value, schema.value)));
      }
      return Option.none();
    });
  }
  function sendToLocalEntityStreamingReply(msg) {
    return (0, _Function.pipe)(Effect.gen(function* (_) {
      const replyChannel = yield* _(ReplyChannel.stream());
      const schema = yield* _(sendToLocalEntity(msg, replyChannel));
      return (0, _Function.pipe)(replyChannel.output, Stream.mapEffect(value => {
        if (Option.isNone(schema)) {
          return Effect.die((0, _ShardError.NotAMessageWithReplier)(msg));
        }
        return serialization.encode(value, schema.value);
      }));
    }), Stream.fromEffect, Stream.flatten);
  }
  function sendToLocalEntity(msg, replyChannel) {
    return (0, _Function.pipe)(Ref.get(entityStates), Effect.flatMap(states => {
      const a = HashMap.get(states, msg.entityType);
      if (Option.isSome(a)) {
        return a.value.processBinary(msg, replyChannel);
      } else {
        return Effect.fail((0, _ShardError.EntityTypeNotRegistered)(msg.entityType, address));
      }
    }));
  }
  function initReply(id, replyChannel) {
    return (0, _Function.pipe)(replyChannels, Synchronized.update(HashMap.set(id, replyChannel)), Effect.zipLeft((0, _Function.pipe)(replyChannel.await, Effect.ensuring(Synchronized.update(replyChannels, HashMap.remove(id))), Effect.forkDaemon)));
  }
  function reply(reply, replier) {
    return Synchronized.updateEffect(replyChannels, repliers => (0, _Function.pipe)(Effect.suspend(() => {
      const replyChannel = HashMap.get(repliers, replier.id);
      if (Option.isSome(replyChannel)) {
        return replyChannel.value.replySingle(reply);
      }
      return Effect.unit;
    }), Effect.as((0, _Function.pipe)(repliers, HashMap.remove(replier.id)))));
  }
  function replyStream(replies, replier) {
    return Synchronized.updateEffect(replyChannels, repliers => (0, _Function.pipe)(Effect.suspend(() => {
      const replyChannel = HashMap.get(repliers, replier.id);
      if (Option.isSome(replyChannel)) {
        return replyChannel.value.replyStream(replies);
      }
      return Effect.unit;
    }), Effect.as((0, _Function.pipe)(repliers, HashMap.remove(replier.id)))));
  }
  function sendToPod(recipientTypeName, entityId, msg, msgSchema, pod, replyId, replyChannel) {
    if (config.simulateRemotePods && (0, Equal.equals)(pod, address)) {
      return (0, _Function.pipe)(serialization.encode(msg, msgSchema), Effect.flatMap(bytes => sendToLocalEntity(BinaryMessage.make(entityId, recipientTypeName, bytes, replyId), replyChannel)), Effect.asUnit);
    } else if ((0, Equal.equals)(pod, address)) {
      // if pod = self, shortcut and send directly without serialization
      return (0, _Function.pipe)(Ref.get(entityStates), Effect.flatMap(_ => (0, _Function.pipe)(HashMap.get(_, recipientTypeName), Option.match({
        onNone: () => Effect.fail((0, _ShardError.EntityTypeNotRegistered)(recipientTypeName, pod)),
        onSome: state => (0, _Function.pipe)(state.entityManager.send(entityId, msg, replyId, replyChannel))
      }))));
    } else {
      return (0, _Function.pipe)(serialization.encode(msg, msgSchema), Effect.flatMap(bytes => {
        const errorHandling = _ => Effect.die("Not handled yet");
        const binaryMessage = BinaryMessage.make(entityId, recipientTypeName, bytes, replyId);
        if (ReplyChannel.isReplyChannelFromDeferred(replyChannel)) {
          return (0, _Function.pipe)(pods.sendMessage(pod, binaryMessage), Effect.tapError(errorHandling), Effect.flatMap(Option.match({
            onNone: () => replyChannel.end,
            onSome: bytes => {
              if (Message.isMessage(msg)) {
                return (0, _Function.pipe)(serialization.decode(bytes, msg.replier.schema), Effect.flatMap(replyChannel.replySingle));
              }
              return Effect.die((0, _ShardError.NotAMessageWithReplier)(msg));
            }
          })));
        }
        if (ReplyChannel.isReplyChannelFromQueue(replyChannel)) {
          return (0, _Function.pipe)(replyChannel.replyStream((0, _Function.pipe)(pods.sendMessageStreaming(pod, binaryMessage), Stream.tapError(errorHandling), Stream.mapEffect(bytes => {
            if (StreamMessage.isStreamMessage(msg)) {
              return serialization.decode(bytes, msg.replier.schema);
            }
            return Effect.die((0, _ShardError.NotAMessageWithReplier)(msg));
          }))));
        }
        return Effect.dieMessage("got unknown replyChannel type");
      }));
    }
  }
  function messenger(entityType, sendTimeout = Option.none()) {
    const timeout = (0, _Function.pipe)(sendTimeout, Option.getOrElse(() => config.sendTimeout));
    function sendDiscard(entityId) {
      return msg => (0, _Function.pipe)(sendMessage(entityId, msg, Option.none()), Effect.timeout(timeout), Effect.asUnit);
    }
    function send(entityId) {
      return fn => {
        return (0, _Function.pipe)(ReplyId.makeEffect, Effect.flatMap(replyId => {
          const body = fn(replyId);
          return (0, _Function.pipe)(sendMessage(entityId, body, Option.some(replyId)), Effect.flatMap(_ => {
            if (Option.isSome(_)) return Effect.succeed(_.value);
            return Effect.fail((0, _ShardError.MessageReturnedNoting)(entityId, body));
          }), Effect.timeoutFail({
            onTimeout: () => (0, _ShardError.SendTimeoutException)(entityType, entityId, body),
            duration: timeout
          }), Effect.interruptible);
        }));
      };
    }
    function sendStream(entityId) {
      return fn => {
        return (0, _Function.pipe)(ReplyId.makeEffect, Effect.flatMap(replyId => {
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
      const trySend = (0, _Function.pipe)(Effect.Do, Effect.bind("shards", () => Ref.get(shardAssignments)), Effect.let("pod", ({
        shards
      }) => HashMap.get(shards, shardId)), Effect.bind("response", ({
        pod
      }) => {
        if (Option.isSome(pod)) {
          return (0, _Function.pipe)(sendToPod(entityType.name, entityId, msg, entityType.schema, pod.value, replyId, replyChannel), Effect.catchSome(_ => {
            if ((0, _ShardError.isEntityNotManagedByThisPodError)(_) || (0, _ShardError.isPodUnavailableError)(_)) {
              return (0, _Function.pipe)(Effect.sleep(Duration.millis(200)), Effect.zipRight(trySend), Option.some);
            }
            return Option.none();
          }), Effect.onError(replyChannel.fail));
        }
        return (0, _Function.pipe)(Effect.sleep(Duration.millis(100)), Effect.zipRight(trySend));
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
    const timeout = (0, _Function.pipe)(sendTimeout, Option.getOrElse(() => config.sendTimeout));
    function sendMessage(topic, body, replyId) {
      return (0, _Function.pipe)(Effect.Do, Effect.bind("pods", () => getPods), Effect.bind("response", ({
        pods
      }) => Effect.forEach(pods, pod => {
        const trySend = Effect.gen(function* (_) {
          const replyChannel = yield* _(ReplyChannel.single());
          yield* _((0, _Function.pipe)(sendToPod(topicType.name, topic, body, topicType.schema, pod, replyId, replyChannel), Effect.catchSome(_ => {
            if ((0, _ShardError.isPodUnavailableError)(_)) {
              return (0, _Function.pipe)(Effect.sleep(Duration.millis(200)), Effect.zipRight(trySend), Option.some);
            }
            return Option.none();
          }), Effect.onError(replyChannel.fail)));
          return yield* _(replyChannel.output);
        });
        return (0, _Function.pipe)(trySend, Effect.flatMap(_ => {
          if (Option.isSome(_)) return Effect.succeed(_.value);
          return Effect.fail((0, _ShardError.MessageReturnedNoting)(topic, body));
        }), Effect.timeoutFail({
          onTimeout: () => (0, _ShardError.SendTimeoutException)(topicType, topic, body),
          duration: timeout
        }), Effect.either, Effect.map(res => [pod, res]));
      }, {
        concurrency: "inherit"
      })), Effect.map(_ => _.response), Effect.map(HashMap.fromIterable));
    }
    function broadcastDiscard(topic) {
      return msg => (0, _Function.pipe)(sendMessage(topic, msg, Option.none()), Effect.timeout(timeout), Effect.asUnit);
    }
    function broadcast(topic) {
      return fn => {
        return (0, _Function.pipe)(ReplyId.makeEffect, Effect.flatMap(replyId => {
          const body = fn(replyId);
          return (0, _Function.pipe)(sendMessage(topic, body, Option.some(replyId)), Effect.interruptible);
        }));
      };
    }
    return {
      broadcast,
      broadcastDiscard
    };
  }
  function registerEntity(entityType, behavior, terminateMessage = () => Option.none(), entityMaxIdleTime = Option.none()) {
    return (0, _Function.pipe)(registerRecipient(entityType, behavior, terminateMessage, entityMaxIdleTime), Effect.zipRight(Hub.publish(eventsHub, ShardingRegistrationEvent.EntityRegistered(entityType))), Effect.asUnit);
  }
  function registerTopic(topicType, behavior, terminateMessage = () => Option.none()) {
    return (0, _Function.pipe)(registerRecipient(topicType, behavior, terminateMessage, Option.none()), Effect.zipRight(Hub.publish(eventsHub, ShardingRegistrationEvent.TopicRegistered(topicType))), Effect.asUnit);
  }
  const getShardingRegistrationEvents = Stream.fromHub(eventsHub);
  function registerRecipient(recipientType, behavior, terminateMessage = () => Option.none(), entityMaxIdleTime = Option.none()) {
    return Effect.gen(function* ($) {
      const entityManager = yield* $(EntityManager.make(recipientType, behavior, terminateMessage, self, config, entityMaxIdleTime));
      const processBinary = (msg, replyChannel) => (0, _Function.pipe)(serialization.decode(msg.body, recipientType.schema), Effect.flatMap(_ => (0, _Function.pipe)(entityManager.send(msg.entityId, _, msg.replyId, replyChannel), Effect.as(Message.isMessage(_) ? Option.some(_.replier.schema) : StreamMessage.isStreamMessage(_) ? Option.some(_.replier.schema) : Option.none()))), Effect.catchAllCause(_ => Effect.as(replyChannel.fail(_), Option.none())));
      yield* $((0, _Function.pipe)(entityStates, Ref.update(HashMap.set(recipientType.name, EntityState.make(entityManager, processBinary)))));
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
const live = /*#__PURE__*/Layer.scoped(_Sharding.Sharding, /*#__PURE__*/(0, _Function.pipe)(Effect.Do, /*#__PURE__*/Effect.bind("config", () => ShardingConfig.ShardingConfig), /*#__PURE__*/Effect.bind("pods", () => _Pods.Pods), /*#__PURE__*/Effect.bind("shardManager", () => _ShardManagerClient.ShardManagerClient), /*#__PURE__*/Effect.bind("storage", () => Storage.Storage), /*#__PURE__*/Effect.bind("serialization", () => Serialization.Serialization), /*#__PURE__*/Effect.bind("shardsCache", () => Ref.make(HashMap.empty())), /*#__PURE__*/Effect.bind("entityStates", () => Ref.make(HashMap.empty())), /*#__PURE__*/Effect.bind("singletons", _ => (0, _Function.pipe)(Synchronized.make(List.nil())
/*
TODO(Mattia): add finalizer
Effect.flatMap((_) =>
  Effect.ensuring(Synchronized.get(_, (singletons) =>
    Effect.forEach(singletons, ([_, __, fiber]) =>
      Option.isSome(fiber) ? Fiber.interrupt(fiber) : Effect.unit())))
)*/)), /*#__PURE__*/Effect.bind("shuttingDown", () => Ref.make(false)), /*#__PURE__*/Effect.bind("replyChannels", () => Synchronized.make(HashMap.empty())), /*#__PURE__*/Effect.bind("eventsHub", () => Hub.unbounded()), /*#__PURE__*/Effect.let("sharding", _ => make(PodAddress.make(_.config.selfHost, _.config.shardingPort), _.config, _.shardsCache, _.entityStates, _.singletons, _.replyChannels, _.shuttingDown, _.shardManager, _.pods, _.storage, _.serialization, _.eventsHub)), /*#__PURE__*/Effect.tap(_ => _.sharding.refreshAssignments), /*#__PURE__*/Effect.map(_ => _.sharding)));
exports.live = live;
//# sourceMappingURL=ShardingImpl.js.map