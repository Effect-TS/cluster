/**
 * @since 1.0.0
 */
import * as Duration from "@effect/data/Duration";
import * as HashMap from "@effect/data/HashMap";
import * as HashSet from "@effect/data/HashSet";
import * as Option from "@effect/data/Option";
import * as Effect from "@effect/io/Effect";
import * as Fiber from "@effect/io/Fiber";
import * as RefSynchronized from "@effect/io/Ref/Synchronized";
import * as MessageQueue from "@effect/sharding/MessageQueue";
import * as PoisonPill from "@effect/sharding/PoisonPill";
import * as ShardingError from "@effect/sharding/ShardingError";
/**
 * @since 1.0.0
 * @category constructors
 */
export function make(recipientType, behaviour_, sharding, config, options = {}) {
  return Effect.gen(function* (_) {
    const entityMaxIdle = options.entityMaxIdleTime || Option.none();
    const messageQueueConstructor = options.messageQueueConstructor || MessageQueue.inMemory;
    const env = yield* _(Effect.context());
    const entities = yield* _(RefSynchronized.make(HashMap.empty()));
    const behaviour = recipientContext => Effect.provideContext(behaviour_(recipientContext), env);
    function startExpirationFiber(entityId) {
      return Effect.forkDaemon(Effect.interruptible(Effect.asUnit(Effect.zipRight(forkEntityTermination(entityId))(Effect.sleep(Option.getOrElse(() => config.entityMaxIdleTime)(entityMaxIdle))))));
    }
    /**
     * Begins entity termination (if needed) by sending the PoisonPill, return the fiber to wait for completed termination (if any)
     */
    function forkEntityTermination(entityId) {
      return RefSynchronized.modifyEffect(entities, map => Option.match({
        // if no entry is found, the entity has succefully shut down
        onNone: () => Effect.succeed([Option.none(), map]),
        // there is an entry, so we should begin termination
        onSome: ([maybeQueue, expirationFiber, runningFiber]) => Option.match({
          // termination has already begun, keep everything as-is
          onNone: () => Effect.succeed([Option.some(runningFiber), map]),
          // begin to terminate the queue
          onSome: queue => Effect.as([Option.some(runningFiber), HashMap.set(map, entityId, [Option.none(), expirationFiber, runningFiber])])(Effect.catchAllCause(Effect.logError)(queue.offer(PoisonPill.make)))
        })(maybeQueue)
      })(HashMap.get(map, entityId)));
    }
    function send(entityId, req, replyId, replyChannel) {
      function decide(map, entityId) {
        return Option.match({
          onNone: () => Effect.flatMap(sharding.isShuttingDown, isGoingDown => {
            if (isGoingDown) {
              // don't start any fiber while sharding is shutting down
              return Effect.fail(ShardingError.ShardingErrorEntityNotManagedByThisPod(entityId));
            } else {
              // queue doesn't exist, create a new one
              return Effect.gen(function* (_) {
                const queue = yield* _(Effect.provideSomeContext(env)(messageQueueConstructor(entityId)));
                const expirationFiber = yield* _(startExpirationFiber(entityId));
                const executionFiber = yield* _(Effect.forkDaemon(Effect.ensuring(Effect.zipRight(Fiber.interrupt(expirationFiber))(Effect.zipRight(queue.shutdown)(RefSynchronized.update(entities, HashMap.remove(entityId)))))(behaviour({
                  entityId,
                  dequeue: queue.dequeue,
                  reply: (message, reply) => sharding.reply(reply, message.replier),
                  replyStream: (message, replyStream) => sharding.replyStream(replyStream, message.replier)
                }))));
                return [Option.some(queue), HashMap.set(map, entityId, [Option.some(queue), expirationFiber, executionFiber])];
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
          return Option.match({
            onNone: () => Effect.zipLeft(replyChannel.end)(messageQueue.offer(req)),
            onSome: replyId_ => Effect.zipRight(messageQueue.offer(req))(sharding.initReply(replyId_, replyChannel))
          })(replyId);
        }
      })(_.test))(Effect.bind("test", () => RefSynchronized.modifyEffect(entities, map => decide(map, entityId)))(Effect.tap(() => {
        // first, verify that this entity should be handled by this pod
        if (recipientType._tag === "EntityType") {
          return Effect.asUnit(Effect.unlessEffect(Effect.fail(ShardingError.ShardingErrorEntityNotManagedByThisPod(entityId)), sharding.isEntityOnLocalShards(recipientType, entityId)));
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
//# sourceMappingURL=EntityManager.mjs.map