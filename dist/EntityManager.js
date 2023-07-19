"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.make = make;
var Duration = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Duration"));
var _Function = /*#__PURE__*/require("@effect/data/Function");
var HashMap = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashMap"));
var HashSet = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/HashSet"));
var Option = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Option"));
var Deferred = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Deferred"));
var Effect = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Effect"));
var Fiber = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Fiber"));
var Queue = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Queue"));
var RefSynchronized = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/io/Ref/Synchronized"));
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
function make(recipientType, behavior_, terminateMessage, sharding, config, entityMaxIdle) {
  return Effect.gen(function* ($) {
    const entities = yield* $(RefSynchronized.make(HashMap.empty()));
    const env = yield* $(Effect.context());
    const behavior = (entityId, dequeue) => Effect.provideContext(behavior_(entityId, dequeue), env);
    function startExpirationFiber(entityId) {
      return (0, _Function.pipe)(Effect.sleep((0, _Function.pipe)(entityMaxIdle, Option.getOrElse(() => config.entityMaxIdleTime))), Effect.zipRight((0, _Function.pipe)(terminateEntity(entityId), Effect.forkDaemon, Effect.asUnit)), Effect.interruptible, Effect.forkDaemon);
    }
    function terminateEntity(entityId) {
      return RefSynchronized.updateEffect(entities, map => (0, _Function.pipe)(HashMap.get(map, entityId), Option.match({
        // if no queue is found, do nothing
        onNone: () => Effect.succeed(map),
        onSome: ([maybeQueue, interruptionFiber]) => (0, _Function.pipe)(maybeQueue, Option.match({
          onNone: () => Effect.succeed(map),
          onSome: queue => Effect.flatMap(Deferred.make(), p => (0, _Function.pipe)(terminateMessage(p), Option.match({
            onNone: () => Effect.as(Queue.shutdown(queue), HashMap.remove(map, entityId)),
            // if a queue is found, offer the termination message, and set the queue to None so that no new message is enqueued
            onSome: msg => Effect.as((0, _Function.pipe)(Queue.offer(queue, msg), Effect.exit), HashMap.set(map, entityId, [Option.none(), interruptionFiber]))
          })))
        }))
      })));
    }
    function send(entityId, req, replyId, replyChannel) {
      function decide(map, entityId) {
        const test = HashMap.get(map, entityId);
        if (Option.isSome(test) && Option.isSome(test.value[0])) {
          const [queue, interruptionFiber] = test.value;
          // queue exists, delay the interruption fiber and return the queue
          return (0, _Function.pipe)(Fiber.interrupt(interruptionFiber), Effect.zipRight(startExpirationFiber(entityId)), Effect.map(fiber => [queue, HashMap.set(map, entityId, [queue, fiber])]));
        } else if (Option.isSome(test) && Option.isNone(test.value[0])) {
          // the queue is shutting down, stash and retry
          return Effect.succeed([Option.none(), map]);
        } else {
          return Effect.flatMap(sharding.isShuttingDown, isGoingDown => {
            if (isGoingDown) {
              // don't start any fiber while sharding is shutting down
              return Effect.fail(ShardError.EntityNotManagedByThisPod(entityId));
            } else {
              // queue doesn't exist, create a new one
              return (0, _Function.pipe)(Effect.Do, Effect.bind("queue", () => Queue.unbounded()), Effect.bind("expirationFiber", () => startExpirationFiber(entityId)), Effect.tap(_ => (0, _Function.pipe)(behavior(entityId, _.queue), Effect.ensuring((0, _Function.pipe)(RefSynchronized.update(entities, HashMap.remove(entityId)), Effect.zipRight(Queue.shutdown(_.queue)), Effect.zipRight(Fiber.interrupt(_.expirationFiber)))), Effect.forkDaemon)), Effect.let("someQueue", _ => Option.some(_.queue)), Effect.map(_ => [_.someQueue, HashMap.set(map, entityId, [_.someQueue, _.expirationFiber])]));
            }
          });
        }
      }
      return (0, _Function.pipe)(Effect.Do, Effect.tap(() => {
        // first, verify that this entity should be handled by this pod
        if (recipientType._tag === "EntityType") {
          return Effect.unlessEffect(Effect.fail(ShardError.EntityNotManagedByThisPod(entityId)), sharding.isEntityOnLocalShards(recipientType, entityId));
        } else if (recipientType._tag === "TopicType") {
          return Effect.unit;
        }
        return Effect.die("Unhandled recipientType");
      }), Effect.bind("test", () => RefSynchronized.modifyEffect(entities, map => decide(map, entityId))), Effect.tap(_ => (0, _Function.pipe)(_.test, Option.match({
        onNone: () => (0, _Function.pipe)(Effect.sleep(Duration.millis(100)), Effect.zipRight(send(entityId, req, replyId, replyChannel))),
        onSome: queue => {
          return (0, _Function.pipe)(replyId, Option.match({
            onNone: () => Effect.zipLeft(Queue.offer(queue, req), replyChannel.end),
            onSome: replyId_ => Effect.zipRight(sharding.initReply(replyId_, replyChannel), Queue.offer(queue, req))
          }), Effect.catchAllCause(e => (0, _Function.pipe)(Effect.logCause("Debug", {
            message: "Send failed with the following cause:"
          })(e), Effect.zipRight(send(entityId, req, replyId, replyChannel)))));
        }
      }))));
    }
    const terminateAllEntities = Effect.flatMap(RefSynchronized.getAndSet(entities, HashMap.empty()), terminateEntities);
    function terminateEntities(entitiesToTerminate) {
      return (0, _Function.pipe)(Effect.forEach(entitiesToTerminate, ([_, [queue_, __]]) => {
        return Effect.tap(Deferred.make(), p => (0, _Function.pipe)(queue_, Option.match({
          onNone: () => Deferred.succeed(p, true),
          onSome: queue => (0, _Function.pipe)(terminateMessage(p), Option.match({
            onNone: () => Effect.zipRight(Queue.shutdown(queue), Deferred.succeed(p, true)),
            onSome: terminate => Effect.catchAllCause(Queue.offer(queue, terminate), () => Deferred.succeed(p, true))
          }))
        })));
      }), Effect.flatMap(promises => Effect.timeout(Effect.forEach(promises, Deferred.await, {
        discard: true
      }), config.entityTerminationTimeout)));
    }
    function terminateEntitiesOnShards(shards) {
      return (0, _Function.pipe)(RefSynchronized.modify(entities, entities => [HashMap.filter(entities, (_, entityId) => HashSet.has(shards, sharding.getShardId(recipientType, entityId))), entities]), Effect.flatMap(terminateEntities));
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