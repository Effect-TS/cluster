"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.make = make;
var Duration = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Duration"));
var HashMap = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashMap"));
var HashSet = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashSet"));
var Option = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Option"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var Fiber = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Fiber"));
var RefSynchronized = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Ref/Synchronized"));
var Scope = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Scope"));
var PoisonPill = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/PoisonPill"));
var ShardError = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/shardcake/ShardError"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
/**
 * @since 1.0.0
 */

/**
 * @since 1.0.0
 * @category constructors
 */
function make(layerScope, recipientType, behaviour_, sharding, config, messageQueue, entityMaxIdle) {
  return Effect.gen(function* (_) {
    const entities = yield* _(RefSynchronized.make(HashMap.empty()));
    const env = yield* _(Effect.context());
    const behaviour = (entityId, dequeue) => Effect.provideContext(behaviour_(entityId, dequeue), env);
    function startExpirationFiber(entityId) {
      return Effect.forkDaemon(Effect.interruptible(Effect.asUnit(Effect.zipRight(forkEntityTermination(entityId))(Effect.sleep(Option.getOrElse(() => config.entityMaxIdleTime)(entityMaxIdle))))));
    }
    function forkEntityTermination(entityId) {
      return RefSynchronized.modifyEffect(entities, map => Option.match({
        // if no entry is found, the entity has succefully shut down
        onNone: () => Effect.succeed([Option.none(), map]),
        // there is an entry, so we should begin termination
        onSome: ([maybeQueue, expirationFiber, runningFiber]) => Option.match({
          // termination has already begun, keep everything as-is
          onNone: () => Effect.succeed([Option.some(runningFiber), map]),
          // begin to terminate the queue
          onSome: queue => Effect.as([Option.some(runningFiber), HashMap.set(map, entityId, [Option.none(), expirationFiber, runningFiber])])(queue.offer(PoisonPill.make))
        })(maybeQueue)
      })(HashMap.get(map, entityId)));
    }
    function send(entityId, req, replyId, replyChannel) {
      function decide(map, entityId) {
        return Option.match({
          onNone: () => Effect.flatMap(sharding.isShuttingDown, isGoingDown => {
            if (isGoingDown) {
              // don't start any fiber while sharding is shutting down
              return Effect.fail(ShardError.EntityNotManagedByThisPod(entityId));
            } else {
              // queue doesn't exist, create a new one
              return Effect.gen(function* (_) {
                const entityScope = yield* _(Scope.make());
                const queue = yield* _(Scope.extend(entityScope)(messageQueue.make(recipientType, entityId)));
                const expirationFiber = yield* _(startExpirationFiber(entityId));
                const executionFiber = yield* _(Effect.forkDaemon(Effect.ensuring(Effect.zipRight(Fiber.interrupt(expirationFiber))(RefSynchronized.update(entities, HashMap.remove(entityId))))(Scope.use(entityScope)(behaviour(entityId, queue.dequeue)))));
                const someQueue = Option.some(queue);
                return [someQueue, HashMap.set(map, entityId, [someQueue, expirationFiber, executionFiber])];
              });
            }
          }),
          onSome: ([maybeQueue, interruptionFiber, executionFiber]) => Option.match({
            // queue exists, delay the interruption fiber and return the queue
            onSome: () => Effect.map(fiber => [maybeQueue, HashMap.set(map, entityId, [maybeQueue, fiber, executionFiber])])(Effect.zipRight(startExpirationFiber(entityId))(Fiber.interrupt(interruptionFiber))),
            // the queue is shutting down, stash and retry
            onNone: () => Effect.succeed([Option.none(), map])
          })(maybeQueue)
        })(HashMap.get(map, entityId));
      }
      return Effect.tap(_ => Option.match({
        onNone: () => Effect.zipRight(send(entityId, req, replyId, replyChannel))(Effect.sleep(Duration.millis(100))),
        onSome: messageQueue => {
          return Effect.catchAllCause(e => Effect.zipRight(send(entityId, req, replyId, replyChannel))(Effect.logDebug("Send failed with the following cause:", e)))(Option.match({
            onNone: () => Effect.zipLeft(replyChannel.end)(messageQueue.offer(req)),
            onSome: replyId_ => Effect.zipRight(messageQueue.offer(req))(sharding.initReply(replyId_, replyChannel))
          })(replyId));
        }
      })(_.test))(Effect.bind("test", () => RefSynchronized.modifyEffect(entities, map => decide(map, entityId)))(Effect.tap(() => {
        // first, verify that this entity should be handled by this pod
        if (recipientType._tag === "EntityType") {
          return Effect.asUnit(Effect.unlessEffect(Effect.fail(ShardError.EntityNotManagedByThisPod(entityId)), sharding.isEntityOnLocalShards(recipientType, entityId)));
        } else if (recipientType._tag === "TopicType") {
          return Effect.unit;
        }
        return Effect.die("Unhandled recipientType");
      })(Effect.Do)));
    }
    const terminateAllEntities = Effect.flatMap(terminateEntities)(Effect.map(HashMap.keySet)(RefSynchronized.get(entities)));
    function terminateEntities(entitiesToTerminate) {
      return Effect.asUnit(Effect.forEach(entityId => Effect.flatMap(Option.match({
        onNone: () => Effect.unit,
        onSome: executionFiber => Effect.asUnit(Effect.flatMap(Option.match({
          onNone: () => Effect.logError(`Entity ${recipientType.name + "#" + entityId} do not interrupted before entityTerminationTimeout (${Duration.toMillis(config.entityTerminationTimeout)}ms) . Are you sure that you properly handled PoisonPill message?`),
          onSome: () => Effect.logDebug(`Entity ${recipientType.name + "#" + entityId} cleaned up.`)
        }))(Effect.timeout(config.entityTerminationTimeout)(Effect.zipRight(Fiber.await(executionFiber))(Effect.logDebug("Waiting for shutdown of " + entityId)))))
      }))(forkEntityTermination(entityId)), {
        concurrency: "inherit"
      })(entitiesToTerminate));
    }
    function terminateEntitiesOnShards(shards) {
      return Effect.flatMap(terminateEntities)(Effect.map(HashMap.keySet)(RefSynchronized.modify(entities, entities => [HashMap.filter(entities, (_, entityId) => HashSet.has(shards, sharding.getShardId(recipientType, entityId))), entities])));
    }
    const self = {
      send,
      terminateAllEntities,
      terminateEntitiesOnShards
    };
    return self;
  });
}
//# sourceMappingURL=EntityManager.js.map