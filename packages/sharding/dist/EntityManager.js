"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.make = make;
var MessageQueue = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/MessageQueue"));
var PoisonPill = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/PoisonPill"));
var ShardingError = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/sharding/ShardingError"));
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
    const entities = yield* _(RefSynchronized.make(HashMap.empty()));
    const behaviour = recipientContext => Effect.provide(behaviour_(recipientContext), env);
    function startExpirationFiber(entityId) {
      return (0, _Function.pipe)(Effect.sleep((0, _Function.pipe)(entityMaxIdle, Option.getOrElse(() => config.entityMaxIdleTime))), Effect.zipRight(forkEntityTermination(entityId)), Effect.asUnit, Effect.interruptible, Effect.forkDaemon);
    }
    /**
     * Begins entity termination (if needed) by sending the PoisonPill, return the fiber to wait for completed termination (if any)
     */
    function forkEntityTermination(entityId) {
      return RefSynchronized.modifyEffect(entities, map => (0, _Function.pipe)(HashMap.get(map, entityId), Option.match({
        // if no entry is found, the entity has succefully shut down
        onNone: () => Effect.succeed([Option.none(), map]),
        // there is an entry, so we should begin termination
        onSome: ([maybeQueue, expirationFiber, runningFiber]) => (0, _Function.pipe)(maybeQueue, Option.match({
          // termination has already begun, keep everything as-is
          onNone: () => Effect.succeed([Option.some(runningFiber), map]),
          // begin to terminate the queue
          onSome: queue => (0, _Function.pipe)(queue.offer(PoisonPill.make), Effect.catchAllCause(Effect.logError), Effect.as([Option.some(runningFiber), HashMap.set(map, entityId, [Option.none(), expirationFiber, runningFiber])]))
        }))
      })));
    }
    function send(entityId, req, replyId, replyChannel) {
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
                const expirationFiber = yield* _(startExpirationFiber(entityId));
                const executionFiber = yield* _((0, _Function.pipe)(behaviour({
                  entityId,
                  dequeue: queue.dequeue,
                  reply: (message, reply) => sharding.reply(reply, message.replier),
                  replyStream: (message, replyStream) => sharding.replyStream(replyStream, message.replier)
                }), Effect.ensuring((0, _Function.pipe)(RefSynchronized.update(entities, HashMap.remove(entityId)), Effect.zipRight(queue.shutdown), Effect.zipRight(Fiber.interrupt(expirationFiber)))), Effect.forkDaemon));
                return [Option.some(queue), HashMap.set(map, entityId, [Option.some(queue), expirationFiber, executionFiber])];
              });
            }
          }),
          onSome: ([maybeQueue, interruptionFiber, executionFiber]) => (0, _Function.pipe)(maybeQueue, Option.match({
            // queue exists, delay the interruption fiber and return the queue
            onSome: () => (0, _Function.pipe)(Fiber.interrupt(interruptionFiber), Effect.zipRight(startExpirationFiber(entityId)), Effect.map(fiber => [maybeQueue, HashMap.set(map, entityId, [maybeQueue, fiber, executionFiber])])),
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
      }), Effect.bind("test", () => RefSynchronized.modifyEffect(entities, map => decide(map, entityId))), Effect.tap(_ => (0, _Function.pipe)(_.test, Option.match({
        onNone: () => (0, _Function.pipe)(Effect.sleep(Duration.millis(100)), Effect.zipRight(send(entityId, req, replyId, replyChannel))),
        onSome: messageQueue => {
          return (0, _Function.pipe)(replyId, Option.match({
            onNone: () => (0, _Function.pipe)(messageQueue.offer(req), Effect.zipLeft(replyChannel.end)),
            onSome: replyId_ => (0, _Function.pipe)(sharding.initReply(replyId_, replyChannel), Effect.zipRight(messageQueue.offer(req)))
          }));
        }
      }))));
    }
    const terminateAllEntities = (0, _Function.pipe)(RefSynchronized.get(entities), Effect.map(HashMap.keySet), Effect.flatMap(terminateEntities));
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
      return (0, _Function.pipe)(RefSynchronized.modify(entities, entities => [HashMap.filter(entities, (_, entityId) => HashSet.has(shards, sharding.getShardId(recipientType, entityId))), entities]), Effect.map(HashMap.keySet), Effect.flatMap(terminateEntities));
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