"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.live = void 0;
var Duration = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Duration"));
var Equal = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Equal"));
var HashMap = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashMap"));
var HashSet = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashSet"));
var List = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/List"));
var Option = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Option"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var Fiber = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Fiber"));
var Hub = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Hub"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Layer"));
var Ref = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Ref"));
var Synchronized = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Ref/Synchronized"));
var Schedule = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Schedule"));
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
var Stream = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/stream/Stream"));
var Sharding = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("./Sharding"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/** @internal */
function make(layerScope, address, config, shardAssignments, entityStates, singletons, replyChannels,
// reply channel for each pending reply,
// lastUnhealthyNodeReported: Ref.Ref<Date>,
isShuttingDownRef, shardManager, pods, storage, serialization, eventsHub) {
  function getShardId(recipientType, entityId) {
    return RecipientType.getShardId(entityId, config.numberOfShards);
  }
  const register = Effect.zipRight(shardManager.register(address))(Effect.zipRight(Ref.set(false)(isShuttingDownRef))(Effect.logDebug(`Registering pod ${PodAddress.show(address)} to Shard Manager`)));
  const unregister = Effect.matchCauseEffect({
    onFailure: _ => Effect.logWarning("Shard Manager not available. Can't unregister cleanly", _),
    onSuccess: () => Effect.zipRight(shardManager.unregister(address))(Effect.zipRight(Effect.logDebug(`Unregistering pod ${PodAddress.show(address)} to Shard Manager`))(Effect.zipRight(Effect.flatMap(Effect.forEach(([name, entityState]) => Effect.catchAllCause(_ => Effect.logError("Error during stop of entity " + name, _))(entityState.entityManager.terminateAllEntities), {
      discard: true
    }))(Ref.get(entityStates)))(Effect.zipRight(Ref.set(true)(isShuttingDownRef))(Effect.logDebug(`Stopping local entities`)))))
  })(shardManager.getAssignments);
  const isSingletonNode = Effect.map(_ => Option.match({
    onNone: () => false,
    onSome: (0, Equal.equals)(address)
  })(HashMap.get(_, ShardId.make(1))))(Ref.get(shardAssignments));
  const startSingletonsIfNeeded = Effect.asUnit(Effect.whenEffect(isSingletonNode)(Synchronized.updateEffect(singletons, singletons => Effect.map(List.fromIterable)(Effect.forEach(singletons, ([name, run, maybeExecutionFiber]) => Option.match(maybeExecutionFiber, {
    onNone: () => Effect.zipRight(Effect.map(Effect.forkIn(layerScope)(run), fiber => [name, run, Option.some(fiber)]))(Effect.logDebug("Starting singleton " + name)),
    onSome: _ => Effect.succeed([name, run, maybeExecutionFiber])
  }))))));
  const stopSingletonsIfNeeded = Effect.asUnit(Effect.unlessEffect(isSingletonNode)(Synchronized.updateEffect(singletons, singletons => Effect.map(List.fromIterable)(Effect.forEach(singletons, ([name, run, maybeExecutionFiber]) => Option.match(maybeExecutionFiber, {
    onNone: () => Effect.succeed([name, run, maybeExecutionFiber]),
    onSome: fiber => Effect.zipRight(Effect.as(Fiber.interrupt(fiber), [name, run, Option.none()]))(Effect.logDebug("Stopping singleton " + name))
  }))))));
  function registerSingleton(name, run) {
    return Effect.zipRight(Hub.publish(eventsHub, ShardingRegistrationEvent.SingletonRegistered(name)))(Effect.zipLeft(startSingletonsIfNeeded)(Effect.flatMap(context => Synchronized.update(singletons, list => List.prepend(list, [name, Effect.provideContext(run, context), Option.none()])))(Effect.context())));
  }
  const isShuttingDown = Ref.get(isShuttingDownRef);
  function assign(shards) {
    return Effect.asUnit(Effect.unlessEffect(isShuttingDown)(Effect.zipLeft(Effect.logDebug("Assigned shards: " + (0, _utils.showHashSet)(ShardId.show)(shards)))(Effect.zipRight(startSingletonsIfNeeded)(Ref.update(shardAssignments, _ => HashSet.reduce(shards, _, (_, shardId) => HashMap.set(_, shardId, address)))))));
  }
  function unassign(shards) {
    return Effect.zipLeft(Effect.logDebug("Unassigning shards: " + (0, _utils.showHashSet)(ShardId.show)(shards)))(Effect.zipRight(stopSingletonsIfNeeded)(Ref.update(shardAssignments, _ => HashSet.reduce(shards, _, (_, shardId) => {
      const value = HashMap.get(_, shardId);
      if (Option.isSome(value) && (0, Equal.equals)(value.value, address)) {
        return HashMap.remove(_, shardId);
      }
      return _;
    }))));
  }
  function isEntityOnLocalShards(recipientType, entityId) {
    return Effect.map(_ => Option.isSome(_.pod) && (0, Equal.equals)(_.pod.value, address))(Effect.let("pod", ({
      shardId,
      shards
    }) => HashMap.get(shardId)(shards))(Effect.let("shardId", () => getShardId(recipientType, entityId))(Effect.bind("shards", () => Ref.get(shardAssignments))(Effect.Do))));
  }
  const getPods = Effect.map(_ => HashSet.fromIterable(HashMap.values(_)))(Ref.get(shardAssignments));
  function updateAssignments(assignmentsOpt, fromShardManager) {
    const assignments = HashMap.map(assignmentsOpt, (v, _) => Option.getOrElse(v, () => address));
    if (fromShardManager) {
      return Ref.update(shardAssignments, map => HashMap.isEmpty(map) ? assignments : map);
    }
    return Ref.update(shardAssignments, map => {
      // we keep self assignments (we don't override them with the new assignments
      // because only the Shard Manager is able to change assignments of the current node, via assign/unassign
      return HashMap.union(HashMap.filter((pod, _) => !Equal.equals(pod, address))(assignments), HashMap.filter((pod, _) => Equal.equals(pod, address))(map));
    });
  }
  const refreshAssignments = Effect.asUnit(Effect.forkScoped(Effect.interruptible(Effect.retry(Schedule.fixed(config.refreshAssignmentsRetryInterval))(Stream.runDrain(Stream.tap(() => startSingletonsIfNeeded)(Stream.mapEffect(([assignmentsOpt, fromShardManager]) => updateAssignments(assignmentsOpt, fromShardManager))(Stream.merge(Stream.map(_ => [_, false])(storage.assignmentsStream))(Stream.fromEffect(Effect.map(shardManager.getAssignments, _ => [_, true]))))))))));
  function sendToLocalEntitySingleReply(msg) {
    return Effect.gen(function* (_) {
      const replyChannel = yield* _(ReplyChannel.single());
      const schema = yield* _(sendToLocalEntity(msg, replyChannel));
      const res = yield* _(replyChannel.output);
      if (Option.isSome(res)) {
        if (Option.isNone(schema)) {
          return yield* _(Effect.die((0, _utils.NotAMessageWithReplierDefect)(msg)));
        }
        return Option.some(yield* _(serialization.encode(res.value, schema.value)));
      }
      return Option.none();
    });
  }
  function sendToLocalEntityStreamingReply(msg) {
    return Stream.flatten()(Stream.fromEffect(Effect.gen(function* (_) {
      const replyChannel = yield* _(ReplyChannel.stream());
      const schema = yield* _(sendToLocalEntity(msg, replyChannel));
      return Stream.mapEffect(value => {
        if (Option.isNone(schema)) {
          return Effect.die((0, _utils.NotAMessageWithReplierDefect)(msg));
        }
        return serialization.encode(value, schema.value);
      })(replyChannel.output);
    })));
  }
  function sendToLocalEntity(msg, replyChannel) {
    return Effect.flatMap(_ => Effect.unified(Option.match(_, {
      onNone: () => Effect.fail(ShardingError.ShardingEntityTypeNotRegisteredError(msg.entityType, address)),
      onSome: entityState => entityState.processBinary(msg, replyChannel)
    })))(Effect.map(HashMap.get(msg.entityType))(Ref.get(entityStates)));
  }
  function initReply(id, replyChannel) {
    return Effect.zipLeft(Effect.forkIn(layerScope)(Effect.ensuring(Synchronized.update(replyChannels, HashMap.remove(id)))(replyChannel.await)))(Synchronized.update(HashMap.set(id, replyChannel))(replyChannels));
  }
  function reply(reply, replier) {
    return Synchronized.updateEffect(replyChannels, repliers => Effect.as(HashMap.remove(replier.id)(repliers))(Effect.suspend(() => {
      const replyChannel = HashMap.get(repliers, replier.id);
      if (Option.isSome(replyChannel)) {
        return replyChannel.value.replySingle(reply);
      }
      return Effect.unit;
    })));
  }
  function replyStream(replies, replier) {
    return Synchronized.updateEffect(replyChannels, repliers => Effect.as(HashMap.remove(replier.id)(repliers))(Effect.suspend(() => {
      const replyChannel = HashMap.get(repliers, replier.id);
      if (Option.isSome(replyChannel)) {
        return replyChannel.value.replyStream(replies);
      }
      return Effect.unit;
    })));
  }
  function sendToPod(recipientTypeName, entityId, msg, msgSchema, pod, replyId, replyChannel) {
    if (config.simulateRemotePods && (0, Equal.equals)(pod, address)) {
      return Effect.asUnit(Effect.flatMap(bytes => sendToLocalEntity(BinaryMessage.make(entityId, recipientTypeName, bytes, replyId), replyChannel))(serialization.encode(msg, msgSchema)));
    } else if ((0, Equal.equals)(pod, address)) {
      // if pod = self, shortcut and send directly without serialization
      return Effect.flatMap(_ => Effect.unified(Option.match({
        onNone: () => Effect.fail(ShardingError.ShardingEntityTypeNotRegisteredError(recipientTypeName, pod)),
        onSome: state => state.entityManager.send(entityId, msg, replyId, replyChannel)
      })(HashMap.get(_, recipientTypeName))))(Ref.get(entityStates));
    } else {
      return Effect.flatMap(bytes => {
        const errorHandling = _ => Effect.die("Not handled yet");
        const binaryMessage = BinaryMessage.make(entityId, recipientTypeName, bytes, replyId);
        if (ReplyChannel.isReplyChannelFromDeferred(replyChannel)) {
          return Effect.flatMap(Option.match({
            onNone: () => replyChannel.end,
            onSome: bytes => {
              if (Message.isMessage(msg)) {
                return Effect.flatMap(replyChannel.replySingle)(serialization.decode(bytes, msg.replier.schema));
              }
              return Effect.die((0, _utils.NotAMessageWithReplierDefect)(msg));
            }
          }))(Effect.tapError(errorHandling)(pods.sendMessage(pod, binaryMessage)));
        }
        if (ReplyChannel.isReplyChannelFromQueue(replyChannel)) {
          return replyChannel.replyStream(Stream.mapEffect(bytes => {
            if (StreamMessage.isStreamMessage(msg)) {
              return serialization.decode(bytes, msg.replier.schema);
            }
            return Effect.die((0, _utils.NotAMessageWithReplierDefect)(msg));
          })(Stream.tapError(errorHandling)(pods.sendMessageStreaming(pod, binaryMessage))));
        }
        return Effect.dieMessage("got unknown replyChannel type");
      })(serialization.encode(msg, msgSchema));
    }
  }
  function messenger(entityType, sendTimeout = Option.none()) {
    const timeout = Option.getOrElse(() => config.sendTimeout)(sendTimeout);
    function sendDiscard(entityId) {
      return msg => Effect.asUnit(Effect.timeout(timeout)(sendMessage(entityId, msg, Option.none())));
    }
    function send(entityId) {
      return fn => {
        return Effect.flatMap(replyId => {
          const body = fn(replyId);
          return Effect.interruptible(Effect.timeoutFail({
            onTimeout: ShardingError.ShardingSendTimeoutError,
            duration: timeout
          })(Effect.flatMap(_ => {
            if (Option.isSome(_)) return Effect.succeed(_.value);
            return Effect.die((0, _utils.MessageReturnedNotingDefect)(entityId));
          })(sendMessage(entityId, body, Option.some(replyId)))));
        })(ReplyId.makeEffect);
      };
    }
    function sendStream(entityId) {
      return fn => {
        return Effect.flatMap(replyId => {
          const body = fn(replyId);
          return sendMessageStreaming(entityId, body, Option.some(replyId));
        })(ReplyId.makeEffect);
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
      const trySend = Effect.asUnit(Effect.bind("response", ({
        pod
      }) => {
        if (Option.isSome(pod)) {
          return Effect.onError(replyChannel.fail)(Effect.catchSome(_ => {
            if (ShardingError.isShardingEntityNotManagedByThisPodError(_) || ShardingError.isShardingPodUnavailableError(_)) {
              return Option.some(Effect.zipRight(trySend)(Effect.sleep(Duration.millis(200))));
            }
            return Option.none();
          })(sendToPod(entityType.name, entityId, msg, entityType.schema, pod.value, replyId, replyChannel)));
        }
        return Effect.zipRight(trySend)(Effect.sleep(Duration.millis(100)));
      })(Effect.let("pod", ({
        shards
      }) => HashMap.get(shards, shardId))(Effect.bind("shards", () => Ref.get(shardAssignments))(Effect.Do))));
      return trySend;
    }
    return {
      sendDiscard,
      send,
      sendStream
    };
  }
  function broadcaster(topicType, sendTimeout = Option.none()) {
    const timeout = Option.getOrElse(() => config.sendTimeout)(sendTimeout);
    function sendMessage(topic, body, replyId) {
      return Effect.map(HashMap.fromIterable)(Effect.map(_ => _.response)(Effect.bind("response", ({
        pods
      }) => Effect.forEach(pods, pod => {
        const trySend = Effect.gen(function* (_) {
          const replyChannel = yield* _(ReplyChannel.single());
          yield* _(Effect.onError(replyChannel.fail)(Effect.catchSome(_ => {
            if (ShardingError.isShardingPodUnavailableError(_)) {
              return Option.some(Effect.zipRight(trySend)(Effect.sleep(Duration.millis(200))));
            }
            return Option.none();
          })(sendToPod(topicType.name, topic, body, topicType.schema, pod, replyId, replyChannel))));
          return yield* _(replyChannel.output);
        });
        return Effect.map(res => [pod, res])(Effect.either(Effect.timeoutFail({
          onTimeout: ShardingError.ShardingSendTimeoutError,
          duration: timeout
        })(Effect.flatMap(_ => {
          if (Option.isSome(_)) return Effect.succeed(_.value);
          return Effect.die((0, _utils.MessageReturnedNotingDefect)(topic));
        })(trySend))));
      }, {
        concurrency: "inherit"
      }))(Effect.bind("pods", () => getPods)(Effect.Do))));
    }
    function broadcastDiscard(topic) {
      return msg => Effect.asUnit(Effect.timeout(timeout)(sendMessage(topic, msg, Option.none())));
    }
    function broadcast(topic) {
      return fn => {
        return Effect.flatMap(replyId => {
          const body = fn(replyId);
          return Effect.interruptible(sendMessage(topic, body, Option.some(replyId)));
        })(ReplyId.makeEffect);
      };
    }
    return {
      broadcast,
      broadcastDiscard
    };
  }
  function registerEntity(entityType, behavior, options) {
    return Effect.asUnit(Effect.zipRight(Hub.publish(eventsHub, ShardingRegistrationEvent.EntityRegistered(entityType)))(registerRecipient(entityType, behavior, options)));
  }
  function registerTopic(topicType, behavior, options) {
    return Effect.asUnit(Effect.zipRight(Hub.publish(eventsHub, ShardingRegistrationEvent.TopicRegistered(topicType)))(registerRecipient(topicType, behavior, options)));
  }
  const getShardingRegistrationEvents = Stream.fromHub(eventsHub);
  function registerRecipient(recipientType, behavior, options) {
    return Effect.gen(function* ($) {
      const entityManager = yield* $(EntityManager.make(recipientType, behavior, self, config, options));
      const processBinary = (msg, replyChannel) => Effect.tapErrorCause(_ => replyChannel.fail(_))(Effect.flatMap(_ => Effect.as(Message.isMessage(_) ? Option.some(_.replier.schema) : StreamMessage.isStreamMessage(_) ? Option.some(_.replier.schema) : Option.none())(entityManager.send(msg.entityId, _, msg.replyId, replyChannel)))(serialization.decode(msg.body, recipientType.schema)));
      yield* $(Ref.update(entityStates, HashMap.set(recipientType.name, EntityState.make(entityManager, processBinary))));
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
  yield* _(Effect.addFinalizer(() => Effect.flatMap(Effect.forEach(([_, __, fa]) => Option.isSome(fa) ? Fiber.interrupt(fa.value) : Effect.unit))(Synchronized.get(singletons))));
  const sharding = make(layerScope, PodAddress.make(config.selfHost, config.shardingPort), config, shardsCache, entityStates, singletons, replyChannels, shuttingDown, shardManager, pods, storage, serialization, eventsHub);
  yield* _(sharding.refreshAssignments);
  return sharding;
}));
exports.live = live;
//# sourceMappingURL=ShardingImpl.js.map