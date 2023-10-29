"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.live = void 0;
var EntityManager = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/EntityManager"));
var Message = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/Message"));
var PodAddress = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/PodAddress"));
var Pods = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/Pods"));
var RecipientType = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/RecipientType"));
var Serialization = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/Serialization"));
var SerializedEnvelope = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/SerializedEnvelope"));
var ShardId = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/ShardId"));
var Sharding = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/Sharding"));
var ShardingConfig = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/ShardingConfig"));
var ShardingError = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/ShardingError"));
var ShardingRegistrationEvent = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/ShardingRegistrationEvent"));
var ShardManagerClient = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/ShardManagerClient"));
var Storage = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/Storage"));
var _utils = /*#__PURE__*/require("@effect/cluster/utils");
var Duration = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Duration"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Effect"));
var Equal = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Equal"));
var Fiber = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Fiber"));
var _Function = /*#__PURE__*/require("effect/Function");
var HashMap = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/HashMap"));
var HashSet = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/HashSet"));
var Layer = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Layer"));
var List = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/List"));
var Option = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Option"));
var PubSub = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/PubSub"));
var Ref = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Ref"));
var Schedule = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Schedule"));
var Stream = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Stream"));
var Synchronized = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/SynchronizedRef"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/** @internal */
function make(layerScope, address, config, shardAssignments, entityManagers, singletons,
// lastUnhealthyNodeReported: Ref.Ref<Date>,
isShuttingDownRef, shardManager, pods, storage, serialization, eventsHub) {
  function decodeRequest(envelope) {
    return (0, _Function.pipe)(Ref.get(entityManagers), Effect.map(HashMap.get(envelope.entityType)), Effect.flatMap(_ => Effect.unified(Option.match(_, {
      onNone: () => Effect.fail(ShardingError.ShardingErrorEntityTypeNotRegistered(envelope.entityType, address)),
      onSome: entityManager => (0, _Function.pipe)(serialization.decode(entityManager.recipientType.schema, envelope.body), Effect.map(request => [request, entityManager]))
    }))));
  }
  function encodeReply(request, reply) {
    if (Option.isNone(reply)) {
      return Effect.succeed(Option.none());
    }
    if (!Message.isMessage(request)) {
      return Effect.die((0, _utils.NotAMessageWithReplierDefect)(request));
    }
    return (0, _Function.pipe)(serialization.encode(request.replier.schema, reply), Effect.map(Option.some));
  }
  function decodeReply(request, body) {
    if (Option.isNone(body)) {
      return Effect.succeed(Option.none());
    }
    if (!Message.isMessage(request)) {
      return Effect.die((0, _utils.NotAMessageWithReplierDefect)(request));
    }
    return (0, _Function.pipe)(serialization.decode(request.replier.schema, body.value), Effect.map(Option.some));
  }
  function getShardId(recipientType, entityId) {
    return RecipientType.getShardId(entityId, config.numberOfShards);
  }
  const register = (0, _Function.pipe)(Effect.logDebug(`Registering pod ${PodAddress.show(address)} to Shard Manager`), Effect.zipRight((0, _Function.pipe)(isShuttingDownRef, Ref.set(false))), Effect.zipRight(shardManager.register(address)));
  const unregister = (0, _Function.pipe)(shardManager.getAssignments, Effect.matchCauseEffect({
    onFailure: _ => Effect.logWarning("Shard Manager not available. Can't unregister cleanly", _),
    onSuccess: () => (0, _Function.pipe)(Effect.logDebug(`Stopping local entities`), Effect.zipRight((0, _Function.pipe)(isShuttingDownRef, Ref.set(true))), Effect.zipRight((0, _Function.pipe)(Ref.get(entityManagers), Effect.flatMap(Effect.forEach(([name, entityManager]) => (0, _Function.pipe)(entityManager.terminateAllEntities, Effect.catchAllCause(_ => Effect.logError("Error during stop of entity " + name, _))), {
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
    return (0, _Function.pipe)(Effect.context(), Effect.flatMap(context => Synchronized.update(singletons, list => List.prepend(list, [name, Effect.provide(run, context), Option.none()]))), Effect.zipLeft(startSingletonsIfNeeded), Effect.zipRight(PubSub.publish(eventsHub, ShardingRegistrationEvent.SingletonRegistered(name))));
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
  function sendToLocalEntity(envelope) {
    return Effect.gen(function* (_) {
      const [request, entityManager] = yield* _(decodeRequest(envelope));
      return yield* _(entityManager.send(envelope.entityId, request, envelope.replyId), Effect.flatMap(_ => encodeReply(request, _)));
    });
  }
  function sendToPod(recipientTypeName, entityId, msg, msgSchema, pod, replyId) {
    if (config.simulateRemotePods && (0, Equal.equals)(pod, address)) {
      return (0, _Function.pipe)(serialization.encode(msgSchema, msg), Effect.flatMap(bytes => (0, _Function.pipe)(decodeRequest(SerializedEnvelope.make(entityId, recipientTypeName, bytes, replyId)), Effect.flatMap(([request, entityManager]) => entityManager.send(entityId, request, replyId)))));
    } else if ((0, Equal.equals)(pod, address)) {
      // if pod = self, shortcut and send directly without serialization
      return (0, _Function.pipe)(Ref.get(entityManagers), Effect.flatMap(_ => (0, _Function.pipe)(HashMap.get(_, recipientTypeName), Option.match({
        onNone: () => Effect.fail(ShardingError.ShardingErrorEntityTypeNotRegistered(recipientTypeName, pod)),
        onSome: entityManager => entityManager.send(entityId, msg, replyId)
      }))), Effect.unified);
    } else {
      return (0, _Function.pipe)(serialization.encode(msgSchema, msg), Effect.flatMap(bytes => {
        const errorHandling = _ => Effect.die("Not handled yet");
        const envelope = SerializedEnvelope.make(entityId, recipientTypeName, bytes, replyId);
        return (0, _Function.pipe)(pods.sendMessage(pod, envelope), Effect.tapError(errorHandling), Effect.flatMap(_ => decodeReply(msg, _)), Effect.unified);
      }));
    }
  }
  function messenger(entityType, sendTimeout = Option.none()) {
    const timeout = (0, _Function.pipe)(sendTimeout, Option.getOrElse(() => config.sendTimeout));
    function sendDiscard(entityId) {
      return msg => (0, _Function.pipe)(sendMessage(entityId, msg, Option.none()), Effect.timeout(timeout), Effect.asUnit);
    }
    function send(entityId) {
      return msg => {
        return (0, _Function.pipe)(sendMessage(entityId, msg, Option.some(msg.replier.id)), Effect.flatMap(_ => {
          if (Option.isSome(_)) return Effect.succeed(_.value);
          return Effect.die((0, _utils.MessageReturnedNotingDefect)(entityId));
        }), Effect.timeoutFail({
          onTimeout: ShardingError.ShardingErrorSendTimeout,
          duration: timeout
        }), Effect.interruptible);
      };
    }
    function sendMessage(entityId, msg, replyId) {
      const shardId = getShardId(entityType, entityId);
      const trySend = (0, _Function.pipe)(Effect.Do, Effect.bind("shards", () => Ref.get(shardAssignments)), Effect.let("pod", ({
        shards
      }) => HashMap.get(shards, shardId)), Effect.bind("response", ({
        pod
      }) => {
        if (Option.isSome(pod)) {
          return (0, _Function.pipe)(sendToPod(entityType.name, entityId, msg, entityType.schema, pod.value, replyId), Effect.catchSome(_ => {
            if (ShardingError.isShardingErrorEntityNotManagedByThisPod(_) || ShardingError.isShardingErrorPodUnavailable(_)) {
              return (0, _Function.pipe)(Effect.sleep(Duration.millis(200)), Effect.zipRight(trySend), Option.some);
            }
            return Option.none();
          }));
        }
        return (0, _Function.pipe)(Effect.sleep(Duration.millis(100)), Effect.zipRight(trySend));
      }), Effect.map(_ => _.response));
      return trySend;
    }
    return {
      sendDiscard,
      send
    };
  }
  function broadcaster(topicType, sendTimeout = Option.none()) {
    const timeout = (0, _Function.pipe)(sendTimeout, Option.getOrElse(() => config.sendTimeout));
    function sendMessage(topic, body, replyId) {
      return (0, _Function.pipe)(Effect.Do, Effect.bind("pods", () => getPods), Effect.bind("response", ({
        pods
      }) => Effect.forEach(pods, pod => {
        const trySend = (0, _Function.pipe)(sendToPod(topicType.name, topic, body, topicType.schema, pod, replyId), Effect.catchSome(_ => {
          if (ShardingError.isShardingErrorPodUnavailable(_)) {
            return (0, _Function.pipe)(Effect.sleep(Duration.millis(200)), Effect.zipRight(trySend), Option.some);
          }
          return Option.none();
        }));
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
      return msg => {
        return (0, _Function.pipe)(sendMessage(topic, msg, Option.some(msg.replier.id)), Effect.interruptible);
      };
    }
    return {
      broadcast,
      broadcastDiscard
    };
  }
  function registerEntity(entityType, behavior, options) {
    return (0, _Function.pipe)(registerRecipient(entityType, behavior, options), Effect.zipRight(PubSub.publish(eventsHub, ShardingRegistrationEvent.EntityRegistered(entityType))), Effect.asUnit);
  }
  function registerTopic(topicType, behavior, options) {
    return (0, _Function.pipe)(registerRecipient(topicType, behavior, options), Effect.zipRight(PubSub.publish(eventsHub, ShardingRegistrationEvent.TopicRegistered(topicType))), Effect.asUnit);
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
const live = /*#__PURE__*/Layer.scoped(Sharding.Sharding, /*#__PURE__*/Effect.gen(function* (_) {
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
  yield* _(Effect.addFinalizer(() => (0, _Function.pipe)(Synchronized.get(singletons), Effect.flatMap(Effect.forEach(([_, __, fa]) => Option.isSome(fa) ? Fiber.interrupt(fa.value) : Effect.unit)))));
  const sharding = make(layerScope, PodAddress.make(config.selfHost, config.shardingPort), config, shardsCache, entityManagers, singletons, shuttingDown, shardManager, pods, storage, serialization, eventsHub);
  yield* _(sharding.refreshAssignments);
  return sharding;
}));
exports.live = live;
//# sourceMappingURL=ShardingImpl.js.map