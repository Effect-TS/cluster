/**
 * @since 1.0.0
 */
import * as Duration from "@effect/data/Duration";
import * as Equal from "@effect/data/Equal";
import { equals } from "@effect/data/Equal";
import * as HashMap from "@effect/data/HashMap";
import * as HashSet from "@effect/data/HashSet";
import * as List from "@effect/data/List";
import * as Option from "@effect/data/Option";
import * as Effect from "@effect/io/Effect";
import * as Fiber from "@effect/io/Fiber";
import * as Hub from "@effect/io/Hub";
import * as Layer from "@effect/io/Layer";
import * as Ref from "@effect/io/Ref";
import * as Synchronized from "@effect/io/Ref/Synchronized";
import * as Schedule from "@effect/io/Schedule";
import * as BinaryMessage from "@effect/shardcake/BinaryMessage";
import * as EntityManager from "@effect/shardcake/EntityManager";
import * as EntityState from "@effect/shardcake/EntityState";
import * as Message from "@effect/shardcake/Message";
import * as PodAddress from "@effect/shardcake/PodAddress";
import * as Pods from "@effect/shardcake/Pods";
import * as RecipientType from "@effect/shardcake/RecipientType";
import * as ReplyChannel from "@effect/shardcake/ReplyChannel";
import * as ReplyId from "@effect/shardcake/ReplyId";
import * as Serialization from "@effect/shardcake/Serialization";
import { EntityTypeNotRegistered, isEntityNotManagedByThisPodError, isPodUnavailableError, MessageReturnedNoting, NotAMessageWithReplier, SendTimeoutException } from "@effect/shardcake/ShardError";
import * as ShardId from "@effect/shardcake/ShardId";
import * as ShardingConfig from "@effect/shardcake/ShardingConfig";
import * as ShardingRegistrationEvent from "@effect/shardcake/ShardingRegistrationEvent";
import * as ShardManagerClient from "@effect/shardcake/ShardManagerClient";
import * as Storage from "@effect/shardcake/Storage";
import * as StreamMessage from "@effect/shardcake/StreamMessage";
import { showHashSet } from "@effect/shardcake/utils";
import * as Stream from "@effect/stream/Stream";
import * as Sharding from "./Sharding";
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
    onSome: equals(address)
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
    return Effect.asUnit(Effect.unlessEffect(isShuttingDown)(Effect.zipLeft(Effect.logDebug("Assigned shards: " + showHashSet(ShardId.show)(shards)))(Effect.zipRight(startSingletonsIfNeeded)(Ref.update(shardAssignments, _ => HashSet.reduce(shards, _, (_, shardId) => HashMap.set(_, shardId, address)))))));
  }
  function unassign(shards) {
    return Effect.zipLeft(Effect.logDebug("Unassigning shards: " + showHashSet(ShardId.show)(shards)))(Effect.zipRight(stopSingletonsIfNeeded)(Ref.update(shardAssignments, _ => HashSet.reduce(shards, _, (_, shardId) => {
      const value = HashMap.get(_, shardId);
      if (Option.isSome(value) && equals(value.value, address)) {
        return HashMap.remove(_, shardId);
      }
      return _;
    }))));
  }
  function isEntityOnLocalShards(recipientType, entityId) {
    return Effect.map(_ => Option.isSome(_.pod) && equals(_.pod.value, address))(Effect.let("pod", ({
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
          return yield* _(Effect.die(NotAMessageWithReplier(msg)));
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
          return Effect.die(NotAMessageWithReplier(msg));
        }
        return serialization.encode(value, schema.value);
      })(replyChannel.output);
    })));
  }
  function sendToLocalEntity(msg, replyChannel) {
    return Effect.flatMap(Option.match({
      onNone: () => Effect.fail(EntityTypeNotRegistered(msg.entityType, address)),
      onSome: entityState => entityState.processBinary(msg, replyChannel)
    }))(Effect.map(HashMap.get(msg.entityType))(Ref.get(entityStates)));
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
    if (config.simulateRemotePods && equals(pod, address)) {
      return Effect.asUnit(Effect.flatMap(bytes => sendToLocalEntity(BinaryMessage.make(entityId, recipientTypeName, bytes, replyId), replyChannel))(serialization.encode(msg, msgSchema)));
    } else if (equals(pod, address)) {
      // if pod = self, shortcut and send directly without serialization
      return Effect.flatMap(_ => Option.match({
        onNone: () => Effect.fail(EntityTypeNotRegistered(recipientTypeName, pod)),
        onSome: state => state.entityManager.send(entityId, msg, replyId, replyChannel)
      })(HashMap.get(_, recipientTypeName)))(Ref.get(entityStates));
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
              return Effect.die(NotAMessageWithReplier(msg));
            }
          }))(Effect.tapError(errorHandling)(pods.sendMessage(pod, binaryMessage)));
        }
        if (ReplyChannel.isReplyChannelFromQueue(replyChannel)) {
          return replyChannel.replyStream(Stream.mapEffect(bytes => {
            if (StreamMessage.isStreamMessage(msg)) {
              return serialization.decode(bytes, msg.replier.schema);
            }
            return Effect.die(NotAMessageWithReplier(msg));
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
            onTimeout: () => SendTimeoutException(entityType, entityId, body),
            duration: timeout
          })(Effect.flatMap(_ => {
            if (Option.isSome(_)) return Effect.succeed(_.value);
            return Effect.fail(MessageReturnedNoting(entityId, body));
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
            if (isEntityNotManagedByThisPodError(_) || isPodUnavailableError(_)) {
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
            if (isPodUnavailableError(_)) {
              return Option.some(Effect.zipRight(trySend)(Effect.sleep(Duration.millis(200))));
            }
            return Option.none();
          })(sendToPod(topicType.name, topic, body, topicType.schema, pod, replyId, replyChannel))));
          return yield* _(replyChannel.output);
        });
        return Effect.map(res => [pod, res])(Effect.either(Effect.timeoutFail({
          onTimeout: () => SendTimeoutException(topicType, topic, body),
          duration: timeout
        })(Effect.flatMap(_ => {
          if (Option.isSome(_)) return Effect.succeed(_.value);
          return Effect.fail(MessageReturnedNoting(topic, body));
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
  function registerEntity(entityType, behavior, entityMaxIdleTime = Option.none()) {
    return Effect.asUnit(Effect.zipRight(Hub.publish(eventsHub, ShardingRegistrationEvent.EntityRegistered(entityType)))(registerRecipient(entityType, behavior, entityMaxIdleTime)));
  }
  function registerTopic(topicType, behavior) {
    return Effect.asUnit(Effect.zipRight(Hub.publish(eventsHub, ShardingRegistrationEvent.TopicRegistered(topicType)))(registerRecipient(topicType, behavior, Option.none())));
  }
  const getShardingRegistrationEvents = Stream.fromHub(eventsHub);
  function registerRecipient(recipientType, behavior, entityMaxIdleTime = Option.none()) {
    return Effect.gen(function* ($) {
      const entityManager = yield* $(EntityManager.make(layerScope, recipientType, behavior, self, config, entityMaxIdleTime));
      const processBinary = (msg, replyChannel) => Effect.catchAllCause(_ => Effect.as(replyChannel.fail(_), Option.none()))(Effect.flatMap(_ => Effect.as(Message.isMessage(_) ? Option.some(_.replier.schema) : StreamMessage.isStreamMessage(_) ? Option.some(_.replier.schema) : Option.none())(entityManager.send(msg.entityId, _, msg.replyId, replyChannel)))(serialization.decode(msg.body, recipientType.schema)));
      yield* $(Ref.update(HashMap.set(recipientType.name, EntityState.make(entityManager, processBinary)))(entityStates));
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
export const live = /*#__PURE__*/Layer.scoped(Sharding.Sharding, /*#__PURE__*/Effect.gen(function* (_) {
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
//# sourceMappingURL=ShardingImpl.mjs.map