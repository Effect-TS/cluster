"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.live = void 0;
var BinaryMessage = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/BinaryMessage"));
var EntityManager = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/EntityManager"));
var EntityState = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/EntityState"));
var Message = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/Message"));
var PodAddress = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/PodAddress"));
var Pods = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/Pods"));
var RecipientType = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/RecipientType"));
var ReplyChannel = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ReplyChannel"));
var ReplyId = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ReplyId"));
var Serialization = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/Serialization"));
var ShardId = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ShardId"));
var ShardingConfig = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ShardingConfig"));
var ShardingError = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ShardingError"));
var ShardingRegistrationEvent = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ShardingRegistrationEvent"));
var ShardManagerClient = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ShardManagerClient"));
var Storage = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/Storage"));
var StreamMessage = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/StreamMessage"));
var _utils = /*#__PURE__*/require("@effect/sharding/utils");
var Duration = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Duration"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Effect"));
var Equal = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Equal"));
var Fiber = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Fiber"));
var _Function = /*#__PURE__*/require("effect/Function");
var HashMap = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/HashMap"));
var HashSet = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/HashSet"));
var Hub = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Hub"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Layer"));
var List = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/List"));
var Option = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Option"));
var Ref = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Ref"));
var Schedule = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Schedule"));
var Stream = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Stream"));
var Synchronized = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/SynchronizedRef"));
var Sharding = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("./Sharding"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/** @internal */
function make(layerScope, address, config, shardAssignments, entityStates, singletons, replyChannels,
// reply channel for each pending reply,
// lastUnhealthyNodeReported: Ref.Ref<Date>,
isShuttingDownRef, shardManager, pods, storage, serialization, eventsHub) {
  function decodeRequest(binaryMessage) {
    return (0, _Function.pipe)(Ref.get(entityStates), Effect.map(HashMap.get(binaryMessage.entityType)), Effect.flatMap(_ => Effect.unified(Option.match(_, {
      onNone: () => Effect.fail(ShardingError.ShardingErrorEntityTypeNotRegistered(binaryMessage.entityType, address)),
      onSome: entityState => (0, _Function.pipe)(serialization.decode(binaryMessage.body, entityState.entityManager.recipientType.schema), Effect.map(request => [request, entityState.entityManager]))
    }))));
  }
  function encodeReply(request, reply) {
    if (!Message.isMessage(request) && !StreamMessage.isStreamMessage(request)) {
      return Effect.die((0, _utils.NotAMessageWithReplierDefect)(request));
    }
    return (0, _Function.pipe)(serialization.encode(reply, request.replier.schema));
  }
  function decodeReply(request, body) {
    if (!Message.isMessage(request) && !StreamMessage.isStreamMessage(request)) {
      return Effect.die((0, _utils.NotAMessageWithReplierDefect)(request));
    }
    return (0, _Function.pipe)(serialization.decode(body, request.replier.schema));
  }
  function getShardId(recipientType, entityId) {
    return RecipientType.getShardId(entityId, config.numberOfShards);
  }
  const register = (0, _Function.pipe)(Effect.logDebug(`Registering pod ${PodAddress.show(address)} to Shard Manager`), Effect.zipRight((0, _Function.pipe)(isShuttingDownRef, Ref.set(false))), Effect.zipRight(shardManager.register(address)));
  const unregister = (0, _Function.pipe)(shardManager.getAssignments, Effect.matchCauseEffect({
    onFailure: _ => Effect.logWarning("Shard Manager not available. Can't unregister cleanly", _),
    onSuccess: () => (0, _Function.pipe)(Effect.logDebug(`Stopping local entities`), Effect.zipRight((0, _Function.pipe)(isShuttingDownRef, Ref.set(true))), Effect.zipRight((0, _Function.pipe)(Ref.get(entityStates), Effect.flatMap(Effect.forEach(([name, entityState]) => (0, _Function.pipe)(entityState.entityManager.terminateAllEntities, Effect.catchAllCause(_ => Effect.logError("Error during stop of entity " + name, _))), {
      discard: true
    })))), Effect.zipRight(Effect.logDebug(`Unregistering pod ${PodAddress.show(address)} to Shard Manager`)), Effect.zipRight(shardManager.unregister(address)))
  }));
  const isSingletonNode = (0, _Function.pipe)(Ref.get(shardAssignments), Effect.map(_ => (0, _Function.pipe)(HashMap.get(_, ShardId.make(1)), Option.match({
    onNone: () => false,
    onSome: (0, Equal.equals)(address)
  }))));
  const startSingletonsIfNeeded = (0, _Function.pipe)(Synchronized.updateEffect(singletons, singletons => (0, _Function.pipe)(Effect.forEach(singletons, ([name, run, maybeExecutionFiber]) => Option.match(maybeExecutionFiber, {
    onNone: () => (0, _Function.pipe)(Effect.logDebug("Starting singleton " + name), Effect.zipRight(Effect.map(Effect.forkIn(layerScope)(run), fiber => [name, run, Option.some(fiber)]))),
    onSome: _ => Effect.succeed([name, run, maybeExecutionFiber])
  })), Effect.map(List.fromIterable))), Effect.whenEffect(isSingletonNode), Effect.asUnit);
  const stopSingletonsIfNeeded = (0, _Function.pipe)(Synchronized.updateEffect(singletons, singletons => (0, _Function.pipe)(Effect.forEach(singletons, ([name, run, maybeExecutionFiber]) => Option.match(maybeExecutionFiber, {
    onNone: () => Effect.succeed([name, run, maybeExecutionFiber]),
    onSome: fiber => (0, _Function.pipe)(Effect.logDebug("Stopping singleton " + name), Effect.zipRight(Effect.as(Fiber.interrupt(fiber), [name, run, Option.none()])))
  })), Effect.map(List.fromIterable))), Effect.unlessEffect(isSingletonNode), Effect.asUnit);
  function registerSingleton(name, run) {
    return (0, _Function.pipe)(Effect.context(), Effect.flatMap(context => Synchronized.update(singletons, list => List.prepend(list, [name, Effect.provide(run, context), Option.none()]))), Effect.zipLeft(startSingletonsIfNeeded), Effect.zipRight(Hub.publish(eventsHub, ShardingRegistrationEvent.SingletonRegistered(name))));
  }
  const isShuttingDown = Ref.get(isShuttingDownRef);
  function assign(shards) {
    return (0, _Function.pipe)(Ref.update(shardAssignments, _ => HashSet.reduce(shards, _, (_, shardId) => HashMap.set(_, shardId, address))), Effect.zipRight(startSingletonsIfNeeded), Effect.zipLeft(Effect.logDebug("Assigned shards: " + (0, _utils.showHashSet)(ShardId.show)(shards))), Effect.unlessEffect(isShuttingDown), Effect.asUnit);
  }
  function unassign(shards) {
    return (0, _Function.pipe)(Ref.update(shardAssignments, _ => HashSet.reduce(shards, _, (_, shardId) => {
      const value = HashMap.get(_, shardId);
      if (Option.isSome(value) && (0, Equal.equals)(value.value, address)) {
        return HashMap.remove(_, shardId);
      }
      return _;
    })), Effect.zipRight(stopSingletonsIfNeeded), Effect.zipLeft(Effect.logDebug("Unassigning shards: " + (0, _utils.showHashSet)(ShardId.show)(shards))));
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
  const refreshAssignments = (0, _Function.pipe)(Stream.fromEffect(Effect.map(shardManager.getAssignments, _ => [_, true])), Stream.merge((0, _Function.pipe)(storage.assignmentsStream, Stream.map(_ => [_, false]))), Stream.mapEffect(([assignmentsOpt, fromShardManager]) => updateAssignments(assignmentsOpt, fromShardManager)), Stream.tap(() => startSingletonsIfNeeded), Stream.runDrain, Effect.retry(Schedule.fixed(config.refreshAssignmentsRetryInterval)), Effect.interruptible, Effect.forkScoped, Effect.asUnit);
  function sendToLocalEntitySingleReply(msg) {
    return (0, _Function.pipe)(sendToLocalEntityStreamingReply(msg), Stream.runHead);
  }
  function sendToLocalEntityStreamingReply(msg) {
    return (0, _Function.pipe)(Effect.gen(function* (_) {
      const [request, entityManager] = yield* _(decodeRequest(msg));
      const replyChannel = yield* _(ReplyChannel.stream());
      yield* _(entityManager.send(msg.entityId, request, msg.replyId, replyChannel));
      return (0, _Function.pipe)(replyChannel.output, Stream.mapEffect(reply => encodeReply(request, reply)));
    }), Stream.fromEffect, Stream.flatten());
  }
  function initReply(id, replyChannel) {
    return (0, _Function.pipe)(replyChannels, Synchronized.update(HashMap.set(id, replyChannel)), Effect.zipLeft((0, _Function.pipe)(replyChannel.await, Effect.ensuring(Synchronized.update(replyChannels, HashMap.remove(id))), Effect.forkIn(layerScope))));
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
      return (0, _Function.pipe)(serialization.encode(msg, msgSchema), Effect.flatMap(bytes => (0, _Function.pipe)(decodeRequest(BinaryMessage.make(entityId, recipientTypeName, bytes, replyId)), Effect.flatMap(([request, entityManager]) => entityManager.send(entityId, request, replyId, replyChannel)))), Effect.asUnit);
    } else if ((0, Equal.equals)(pod, address)) {
      // if pod = self, shortcut and send directly without serialization
      return (0, _Function.pipe)(Ref.get(entityStates), Effect.flatMap(_ => (0, _Function.pipe)(HashMap.get(_, recipientTypeName), Option.match({
        onNone: () => Effect.fail(ShardingError.ShardingErrorEntityTypeNotRegistered(recipientTypeName, pod)),
        onSome: state => (0, _Function.pipe)(state.entityManager.send(entityId, msg, replyId, replyChannel))
      }), Effect.unified)));
    } else {
      return (0, _Function.pipe)(serialization.encode(msg, msgSchema), Effect.flatMap(bytes => {
        const errorHandling = _ => Effect.die("Not handled yet");
        const binaryMessage = BinaryMessage.make(entityId, recipientTypeName, bytes, replyId);
        return (0, _Function.pipe)(replyChannel.replyStream((0, _Function.pipe)(pods.sendMessageStreaming(pod, binaryMessage), Stream.tapError(errorHandling), Stream.mapEffect(bytes => decodeReply(msg, bytes)))));
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
            return Effect.die((0, _utils.MessageReturnedNotingDefect)(entityId));
          }), Effect.timeoutFail({
            onTimeout: ShardingError.ShardingErrorSendTimeout,
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
      return (0, _Function.pipe)(sendMessageStreaming(entityId, msg, replyId), Effect.map(Stream.runHead), Effect.flatten);
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
            if (ShardingError.isShardingErrorEntityNotManagedByThisPod(_) || ShardingError.isShardingErrorPodUnavailable(_)) {
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
          const replyChannel = yield* _(ReplyChannel.stream());
          yield* _((0, _Function.pipe)(sendToPod(topicType.name, topic, body, topicType.schema, pod, replyId, replyChannel), Effect.catchSome(_ => {
            if (ShardingError.isShardingErrorPodUnavailable(_)) {
              return (0, _Function.pipe)(Effect.sleep(Duration.millis(200)), Effect.zipRight(trySend), Option.some);
            }
            return Option.none();
          }), Effect.onError(replyChannel.fail)));
          return yield* _(Stream.runHead(replyChannel.output));
        });
        return (0, _Function.pipe)(trySend, Effect.flatMap(_ => {
          if (Option.isSome(_)) return Effect.succeed(_.value);
          return Effect.die((0, _utils.MessageReturnedNotingDefect)(topic));
        }), Effect.timeoutFail({
          onTimeout: ShardingError.ShardingErrorSendTimeout,
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
  function registerEntity(entityType, behavior, options) {
    return (0, _Function.pipe)(registerRecipient(entityType, behavior, options), Effect.zipRight(Hub.publish(eventsHub, ShardingRegistrationEvent.EntityRegistered(entityType))), Effect.asUnit);
  }
  function registerTopic(topicType, behavior, options) {
    return (0, _Function.pipe)(registerRecipient(topicType, behavior, options), Effect.zipRight(Hub.publish(eventsHub, ShardingRegistrationEvent.TopicRegistered(topicType))), Effect.asUnit);
  }
  const getShardingRegistrationEvents = Stream.fromHub(eventsHub);
  function registerRecipient(recipientType, behavior, options) {
    return Effect.gen(function* ($) {
      const entityManager = yield* $(EntityManager.make(recipientType, behavior, self, config, options));
      yield* $(Ref.update(entityStates, HashMap.set(recipientType.name, EntityState.make(entityManager))));
    });
  }
  const registerScoped = Effect.acquireRelease(register, _ => Effect.orDie(unregister));
  const self = {
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
  };
  return self;
}
/**
 * @since 1.0.0
 * @category layers
 */
const live = /*#__PURE__*/Layer.scoped(Sharding.Sharding, /*#__PURE__*/Effect.gen(function* (_) {
  const config = yield* _(ShardingConfig.ShardingConfig);
  const pods = yield* _(Pods.Pods);
  const shardManager = yield* _(ShardManagerClient.ShardManagerClient);
  const storage = yield* _(Storage.Storage);
  const serialization = yield* _(Serialization.Serialization);
  const shardsCache = yield* _(Ref.make(HashMap.empty()));
  const entityStates = yield* _(Ref.make(HashMap.empty()));
  const shuttingDown = yield* _(Ref.make(false));
  const eventsHub = yield* _(Hub.unbounded());
  const replyChannels = yield* _(Synchronized.make(HashMap.empty()));
  const singletons = yield* _(Synchronized.make(List.nil()));
  const layerScope = yield* _(Effect.scope);
  yield* _(Effect.addFinalizer(() => (0, _Function.pipe)(Synchronized.get(singletons), Effect.flatMap(Effect.forEach(([_, __, fa]) => Option.isSome(fa) ? Fiber.interrupt(fa.value) : Effect.unit)))));
  const sharding = make(layerScope, PodAddress.make(config.selfHost, config.shardingPort), config, shardsCache, entityStates, singletons, replyChannels, shuttingDown, shardManager, pods, storage, serialization, eventsHub);
  yield* _(sharding.refreshAssignments);
  return sharding;
}));
exports.live = live;
//# sourceMappingURL=ShardingImpl.js.map