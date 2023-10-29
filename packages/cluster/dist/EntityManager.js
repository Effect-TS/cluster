"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.make = make;
var EntityState = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/EntityState"));
var MessageQueue = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/MessageQueue"));
var PoisonPill = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/PoisonPill"));
var RecipientBehaviour = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/RecipientBehaviour"));
var ReplyChannel = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/ReplyChannel"));
var ShardingError = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/cluster/ShardingError"));
var Cause = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Cause"));
var Duration = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Duration"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Effect"));
var Fiber = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Fiber"));
var _Function = /*#__PURE__*/require("effect/Function");
var HashMap = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/HashMap"));
var HashSet = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/HashSet"));
var Option = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/Option"));
var RefSynchronized = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("effect/SynchronizedRef"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category constructors
 */
function make(recipientType, behaviour_, sharding, config, options = {}) {
  return Effect.gen(function* (_) {
    const entityMaxIdle = options.entityMaxIdleTime || Option.none();
    const messageQueueConstructor = options.messageQueueConstructor || MessageQueue.inMemory;
    const env = yield* _(Effect.context());
    const entityStates = yield* _(RefSynchronized.make(HashMap.empty()));
    const replyChannels = yield* _(RefSynchronized.make(HashMap.empty()));
    // const behaviour: RecipientBehaviour.RecipientBehaviour<never, Req> = (
    //   recipientContext
    // ) => Effect.provide(behaviour_(recipientContext), env)
    function initReply(id, replyChannel) {
      return (0, _Function.pipe)(replyChannels, RefSynchronized.update(HashMap.set(id, replyChannel)), Effect.zipLeft((0, _Function.pipe)(replyChannel.await, Effect.ensuring(RefSynchronized.update(replyChannels, HashMap.remove(id))), Effect.fork)));
    }
    function reply(replyId, reply) {
      return RefSynchronized.updateEffect(replyChannels, repliers => (0, _Function.pipe)(Effect.suspend(() => {
        const replyChannel = HashMap.get(repliers, replyId);
        if (Option.isSome(replyChannel)) {
          return replyChannel.value.reply(reply);
        }
        return Effect.unit;
      }), Effect.as((0, _Function.pipe)(repliers, HashMap.remove(replyId)))));
    }
    function startExpirationFiber(entityId) {
      return (0, _Function.pipe)(Effect.sleep((0, _Function.pipe)(entityMaxIdle, Option.getOrElse(() => config.entityMaxIdleTime))), Effect.zipRight(forkEntityTermination(entityId)), Effect.asUnit, Effect.interruptible, Effect.forkDaemon);
    }
    /**
     * Begins entity termination (if needed) by sending the PoisonPill, return the fiber to wait for completed termination (if any)
     */
    function forkEntityTermination(entityId) {
      return RefSynchronized.modifyEffect(entityStates, entityStatesMap => (0, _Function.pipe)(HashMap.get(entityStatesMap, entityId), Option.match({
        // if no entry is found, the entity has succefully shut down
        onNone: () => Effect.succeed([Option.none(), entityStatesMap]),
        // there is an entry, so we should begin termination
        onSome: entityState => (0, _Function.pipe)(entityState.messageQueue, Option.match({
          // termination has already begun, keep everything as-is
          onNone: () => Effect.succeed([Option.some(entityState.executionFiber), entityStatesMap]),
          // begin to terminate the queue
          onSome: queue => (0, _Function.pipe)(queue.offer(PoisonPill.make), Effect.catchAllCause(Effect.logError), Effect.as([Option.some(entityState.executionFiber), HashMap.modify(entityStatesMap, entityId, EntityState.withoutMessageQueue)]))
        }))
      })));
    }
    function send(entityId, req, replyId) {
      function decide(map, entityId) {
        return (0, _Function.pipe)(HashMap.get(map, entityId), Option.match({
          onNone: () => Effect.flatMap(sharding.isShuttingDown, isGoingDown => {
            if (isGoingDown) {
              // don't start any fiber while sharding is shutting down
              return Effect.fail(ShardingError.ShardingErrorEntityNotManagedByThisPod(entityId));
            } else {
              // queue doesn't exist, create a new one
              return Effect.gen(function* (_) {
                const queue = yield* _((0, _Function.pipe)(messageQueueConstructor(entityId), Effect.provide(env)));
                const replyChannels = yield* _(RefSynchronized.make(HashMap.empty()));
                const expirationFiber = yield* _(startExpirationFiber(entityId));
                const executionFiber = yield* _((0, _Function.pipe)(behaviour_({
                  entityId,
                  dequeue: queue.dequeue
                }), Effect.provideService(RecipientBehaviour.RecipientBehaviourContext, {
                  entityId,
                  recipientType: recipientType,
                  reply
                }), Effect.provide(env), Effect.ensuring((0, _Function.pipe)(
                // remove from entityStates
                RefSynchronized.update(entityStates, HashMap.remove(entityId)),
                // shutdown the queue
                Effect.zipRight(queue.shutdown),
                // interrupt the expiration timer
                Effect.zipRight(Fiber.interrupt(expirationFiber)),
                // fail all pending reply channels with PodUnavailable
                Effect.zipRight((0, _Function.pipe)(RefSynchronized.get(replyChannels), Effect.flatMap(Effect.forEach(([_, replyChannels]) => replyChannels.fail(Cause.fail(ShardingError.ShardingErrorEntityNotManagedByThisPod(entityId))))))))), Effect.forkDaemon));
                return [Option.some(queue), HashMap.set(map, entityId, EntityState.make({
                  messageQueue: Option.some(queue),
                  expirationFiber,
                  executionFiber,
                  replyChannels
                }))];
              });
            }
          }),
          onSome: entityState => (0, _Function.pipe)(entityState.messageQueue, Option.match({
            // queue exists, delay the interruption fiber and return the queue
            onSome: () => (0, _Function.pipe)(Fiber.interrupt(entityState.expirationFiber), Effect.zipRight(startExpirationFiber(entityId)), Effect.map(fiber => [entityState.messageQueue, HashMap.modify(map, entityId, EntityState.withExpirationFiber(fiber))])),
            // the queue is shutting down, stash and retry
            onNone: () => Effect.succeed([Option.none(), map])
          }))
        }));
      }
      return (0, _Function.pipe)(Effect.Do, Effect.tap(() => {
        // first, verify that this entity should be handled by this pod
        if (recipientType._tag === "EntityType") {
          return Effect.asUnit(Effect.unlessEffect(Effect.fail(ShardingError.ShardingErrorEntityNotManagedByThisPod(entityId)), sharding.isEntityOnLocalShards(recipientType, entityId)));
        } else if (recipientType._tag === "TopicType") {
          return Effect.unit;
        }
        return Effect.die("Unhandled recipientType");
      }), Effect.bind("test", () => RefSynchronized.modifyEffect(entityStates, map => decide(map, entityId))), Effect.flatMap(_ => {
        return (0, _Function.pipe)(_.test, Option.match({
          onNone: () => (0, _Function.pipe)(Effect.sleep(Duration.millis(100)), Effect.flatMap(() => send(entityId, req, replyId))),
          onSome: messageQueue => {
            return (0, _Function.pipe)(replyId, Option.match({
              onNone: () => (0, _Function.pipe)(messageQueue.offer(req), Effect.as(Option.none())),
              onSome: replyId_ => (0, _Function.pipe)(ReplyChannel.make(), Effect.tap(replyChannel => initReply(replyId_, replyChannel)), Effect.zipLeft(messageQueue.offer(req)), Effect.flatMap(_ => _.output))
            }));
          }
        }), Effect.unified);
      }));
    }
    const terminateAllEntities = (0, _Function.pipe)(RefSynchronized.get(entityStates), Effect.map(HashMap.keySet), Effect.flatMap(terminateEntities));
    function terminateEntities(entitiesToTerminate) {
      return (0, _Function.pipe)(entitiesToTerminate, Effect.forEach(entityId => (0, _Function.pipe)(forkEntityTermination(entityId), Effect.flatMap(Option.match({
        onNone: () => Effect.unit,
        onSome: executionFiber => (0, _Function.pipe)(Effect.logDebug("Waiting for shutdown of " + entityId), Effect.zipRight(Fiber.await(executionFiber)), Effect.timeout(config.entityTerminationTimeout), Effect.flatMap(Option.match({
          onNone: () => Effect.logError(`Entity ${recipientType.name + "#" + entityId} do not interrupted before entityTerminationTimeout (${Duration.toMillis(config.entityTerminationTimeout)}ms) . Are you sure that you properly handled PoisonPill message?`),
          onSome: () => Effect.logDebug(`Entity ${recipientType.name + "#" + entityId} cleaned up.`)
        })), Effect.asUnit)
      }))), {
        concurrency: "inherit"
      }), Effect.asUnit);
    }
    function terminateEntitiesOnShards(shards) {
      return (0, _Function.pipe)(RefSynchronized.modify(entityStates, entities => [HashMap.filter(entities, (_, entityId) => HashSet.has(shards, sharding.getShardId(recipientType, entityId))), entities]), Effect.map(HashMap.keySet), Effect.flatMap(terminateEntities));
    }
    const self = {
      recipientType,
      send,
      terminateAllEntities,
      terminateEntitiesOnShards
    };
    return self;
  });
}
//# sourceMappingURL=EntityManager.js.map