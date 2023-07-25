"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.make = make;
var Duration = /*#__PURE__*/_interopRequireWildcard( /*#__PURE__*/require("@effect/data/Duration"));
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
      return Effect.forkDaemon(Effect.interruptible(Effect.zipRight(Effect.asUnit(Effect.forkDaemon(terminateEntity(entityId))))(Effect.sleep(Option.getOrElse(() => config.entityMaxIdleTime)(entityMaxIdle)))));
    }
    function terminateEntity(entityId) {
      return RefSynchronized.updateEffect(entities, map => Option.match({
        // if no queue is found, do nothing
        onNone: () => Effect.succeed(map),
        onSome: ([maybeQueue, interruptionFiber]) => Option.match({
          onNone: () => Effect.succeed(map),
          onSome: queue => Effect.flatMap(Deferred.make(), p => Option.match({
            onNone: () => Effect.as(Queue.shutdown(queue), HashMap.remove(map, entityId)),
            // if a queue is found, offer the termination message, and set the queue to None so that no new message is enqueued
            onSome: msg => Effect.as(Effect.exit(Queue.offer(queue, msg)), HashMap.set(map, entityId, [Option.none(), interruptionFiber]))
          })(terminateMessage(p)))
        })(maybeQueue)
      })(HashMap.get(map, entityId)));
    }
    function send(entityId, req, replyId, replyChannel) {
      function decide(map, entityId) {
        const test = HashMap.get(map, entityId);
        if (Option.isSome(test) && Option.isSome(test.value[0])) {
          const [queue, interruptionFiber] = test.value;
          // queue exists, delay the interruption fiber and return the queue
          return Effect.map(fiber => [queue, HashMap.set(map, entityId, [queue, fiber])])(Effect.zipRight(startExpirationFiber(entityId))(Fiber.interrupt(interruptionFiber)));
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
              return Effect.gen(function* (_) {
                const queue = yield* _(Queue.unbounded());
                const expirationFiber = yield* _(startExpirationFiber(entityId));
                yield* _(Effect.forkDaemon(Effect.catchAllCause(Effect.ensuring(behavior(entityId, queue), Effect.zipRight(Fiber.interrupt(expirationFiber))(Effect.zipRight(Queue.shutdown(queue))(RefSynchronized.update(entities, HashMap.remove(entityId))))), Effect.logError)));
                const someQueue = Option.some(queue);
                return [someQueue, HashMap.set(map, entityId, [someQueue, expirationFiber])];
              });
            }
          });
        }
      }
      return Effect.tap(_ => Option.match({
        onNone: () => Effect.zipRight(send(entityId, req, replyId, replyChannel))(Effect.sleep(Duration.millis(100))),
        onSome: queue => {
          return Effect.catchAllCause(e => Effect.zipRight(send(entityId, req, replyId, replyChannel))(Effect.logDebug("Send failed with the following cause:", e)))(Option.match({
            onNone: () => Effect.zipLeft(Queue.offer(queue, req), replyChannel.end),
            onSome: replyId_ => Effect.zipRight(sharding.initReply(replyId_, replyChannel), Queue.offer(queue, req))
          })(replyId));
        }
      })(_.test))(Effect.bind("test", () => RefSynchronized.modifyEffect(entities, map => decide(map, entityId)))(Effect.tap(() => {
        // first, verify that this entity should be handled by this pod
        if (recipientType._tag === "EntityType") {
          return Effect.unlessEffect(Effect.fail(ShardError.EntityNotManagedByThisPod(entityId)), sharding.isEntityOnLocalShards(recipientType, entityId));
        } else if (recipientType._tag === "TopicType") {
          return Effect.unit;
        }
        return Effect.die("Unhandled recipientType");
      })(Effect.Do)));
    }
    const terminateAllEntities = Effect.flatMap(RefSynchronized.getAndSet(entities, HashMap.empty()), terminateEntities);
    function terminateEntities(entitiesToTerminate) {
      return Effect.flatMap(promises => Effect.timeout(Effect.forEach(promises, Deferred.await, {
        discard: true
      }), config.entityTerminationTimeout))(Effect.forEach(entitiesToTerminate, ([_, [queue_, __]]) => {
        return Effect.tap(Deferred.make(), p => Option.match({
          onNone: () => Deferred.succeed(p, true),
          onSome: queue => Option.match({
            onNone: () => Effect.zipRight(Queue.shutdown(queue), Deferred.succeed(p, true)),
            onSome: terminate => Effect.catchAllCause(Queue.offer(queue, terminate), () => Deferred.succeed(p, true))
          })(terminateMessage(p))
        })(queue_));
      }));
    }
    function terminateEntitiesOnShards(shards) {
      return Effect.flatMap(terminateEntities)(RefSynchronized.modify(entities, entities => [HashMap.filter(entities, (_, entityId) => HashSet.has(shards, sharding.getShardId(recipientType, entityId))), entities]));
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