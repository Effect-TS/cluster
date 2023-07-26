/**
 * @since 1.0.0
 */
import * as Duration from "@effect/data/Duration";
import * as HashMap from "@effect/data/HashMap";
import * as HashSet from "@effect/data/HashSet";
import * as Option from "@effect/data/Option";
import * as Deferred from "@effect/io/Deferred";
import * as Effect from "@effect/io/Effect";
import * as Fiber from "@effect/io/Fiber";
import * as Queue from "@effect/io/Queue";
import * as RefSynchronized from "@effect/io/Ref/Synchronized";
import * as ShardError from "@effect/shardcake/ShardError";
/**
 * @since 1.0.0
 * @category constructors
 */
export function make(recipientType, behavior_, terminateMessage, sharding, config, entityMaxIdle) {
  return Effect.gen(function* ($) {
    const entities = yield* $(RefSynchronized.make(HashMap.empty()));
    const env = yield* $(Effect.context());
    const behavior = (entityId, dequeue, terminatedSignal) => Effect.provideContext(behavior_(entityId, dequeue, terminatedSignal), env);
    function startExpirationFiber(entityId) {
      return Effect.forkDaemon(Effect.interruptible(Effect.zipRight(Effect.asUnit(Effect.forkDaemon(terminateEntity(entityId))))(Effect.sleep(Option.getOrElse(() => config.entityMaxIdleTime)(entityMaxIdle)))));
    }
    function terminateEntity(entityId) {
      return RefSynchronized.updateEffect(entities, map => Option.match({
        // if no queue is found, do nothing
        onNone: () => Effect.succeed(map),
        onSome: ([maybeQueue, interruptionFiber, terminatedSignal]) => Option.match({
          onNone: () => Effect.succeed(map),
          onSome: queue => Option.match({
            onNone: () => Effect.as(HashMap.remove(map, entityId))(Effect.zipRight(Deferred.succeed(terminatedSignal, true))(Queue.shutdown(queue))),
            // if a queue is found, offer the termination message, and set the queue to None so that no new message is enqueued
            onSome: msg => Effect.as(HashMap.set(map, entityId, [Option.none(), interruptionFiber, terminatedSignal]))(Effect.exit(Queue.offer(queue, msg)))
          })(terminateMessage())
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
                const queue = yield* _(Queue.unbounded());
                const expirationFiber = yield* _(startExpirationFiber(entityId));
                const terminatedSignal = yield* _(Deferred.make());
                yield* _(Effect.forkDaemon(Effect.catchAllCause(Effect.ensuring(behavior(entityId, queue, terminatedSignal), Effect.zipRight(Deferred.succeed(terminatedSignal, false))(Effect.zipRight(Fiber.interrupt(expirationFiber))(Effect.zipRight(Queue.shutdown(queue))(RefSynchronized.update(entities, HashMap.remove(entityId)))))), Effect.logError)));
                const someQueue = Option.some(queue);
                return [someQueue, HashMap.set(map, entityId, [someQueue, expirationFiber, terminatedSignal])];
              });
            }
          }),
          onSome: ([maybeQueue, interruptionFiber, terminatedSignal]) => Option.match({
            // queue exists, delay the interruption fiber and return the queue
            onSome: () => Effect.map(fiber => [maybeQueue, HashMap.set(map, entityId, [maybeQueue, fiber, terminatedSignal])])(Effect.zipRight(startExpirationFiber(entityId))(Fiber.interrupt(interruptionFiber))),
            // the queue is shutting down, stash and retry
            onNone: () => Effect.succeed([Option.none(), map])
          })(maybeQueue)
        })(HashMap.get(map, entityId));
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
        /// TODO: uncomment
        // if (recipientType._tag === "EntityType") {
        //   return Effect.unlessEffect(
        //     Effect.fail(ShardError.EntityNotManagedByThisPod(entityId)),
        //     sharding.isEntityOnLocalShards(recipientType, entityId)
        //   )
        // } else if (recipientType._tag === "TopicType") {
        //   return Effect.unit
        // }
        return Effect.unit;
        return Effect.die("Unhandled recipientType");
      })(Effect.Do)));
    }
    const terminateAllEntities = Effect.flatMap(RefSynchronized.get(entities), terminateEntities);
    function terminateEntities(entitiesToTerminate) {
      return Effect.forEach(entitiesToTerminate, ([entityId, [_, __, terminatedSignal]]) => Effect.zipRight(Deferred.await(terminatedSignal))(terminateEntity(entityId)));
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
//# sourceMappingURL=EntityManager.mjs.map