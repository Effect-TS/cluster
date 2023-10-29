/**
 * @since 1.0.0
 */
import * as EntityState from "@effect/cluster/EntityState";
import * as MessageQueue from "@effect/cluster/MessageQueue";
import * as PoisonPill from "@effect/cluster/PoisonPill";
import * as RecipientBehaviour from "@effect/cluster/RecipientBehaviour";
import * as ReplyChannel from "@effect/cluster/ReplyChannel";
import * as ShardingError from "@effect/cluster/ShardingError";
import * as Cause from "effect/Cause";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Option from "effect/Option";
import * as RefSynchronized from "effect/SynchronizedRef";
/**
 * @since 1.0.0
 * @category constructors
 */
export function make(recipientType, behaviour_, sharding, config, options = {}) {
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
      return pipe(replyChannels, RefSynchronized.update(HashMap.set(id, replyChannel)), Effect.zipLeft(pipe(replyChannel.await, Effect.ensuring(RefSynchronized.update(replyChannels, HashMap.remove(id))), Effect.fork)));
    }
    function reply(replyId, reply) {
      return RefSynchronized.updateEffect(replyChannels, repliers => pipe(Effect.suspend(() => {
        const replyChannel = HashMap.get(repliers, replyId);
        if (Option.isSome(replyChannel)) {
          return replyChannel.value.reply(reply);
        }
        return Effect.unit;
      }), Effect.as(pipe(repliers, HashMap.remove(replyId)))));
    }
    function startExpirationFiber(entityId) {
      return pipe(Effect.sleep(pipe(entityMaxIdle, Option.getOrElse(() => config.entityMaxIdleTime))), Effect.zipRight(forkEntityTermination(entityId)), Effect.asUnit, Effect.interruptible, Effect.forkDaemon);
    }
    /**
     * Begins entity termination (if needed) by sending the PoisonPill, return the fiber to wait for completed termination (if any)
     */
    function forkEntityTermination(entityId) {
      return RefSynchronized.modifyEffect(entityStates, entityStatesMap => pipe(HashMap.get(entityStatesMap, entityId), Option.match({
        // if no entry is found, the entity has succefully shut down
        onNone: () => Effect.succeed([Option.none(), entityStatesMap]),
        // there is an entry, so we should begin termination
        onSome: entityState => pipe(entityState.messageQueue, Option.match({
          // termination has already begun, keep everything as-is
          onNone: () => Effect.succeed([Option.some(entityState.executionFiber), entityStatesMap]),
          // begin to terminate the queue
          onSome: queue => pipe(queue.offer(PoisonPill.make), Effect.catchAllCause(Effect.logError), Effect.as([Option.some(entityState.executionFiber), HashMap.modify(entityStatesMap, entityId, EntityState.withoutMessageQueue)]))
        }))
      })));
    }
    function send(entityId, req, replyId) {
      function decide(map, entityId) {
        return pipe(HashMap.get(map, entityId), Option.match({
          onNone: () => Effect.flatMap(sharding.isShuttingDown, isGoingDown => {
            if (isGoingDown) {
              // don't start any fiber while sharding is shutting down
              return Effect.fail(ShardingError.ShardingErrorEntityNotManagedByThisPod(entityId));
            } else {
              // queue doesn't exist, create a new one
              return Effect.gen(function* (_) {
                const queue = yield* _(pipe(messageQueueConstructor(entityId), Effect.provide(env)));
                const replyChannels = yield* _(RefSynchronized.make(HashMap.empty()));
                const expirationFiber = yield* _(startExpirationFiber(entityId));
                const executionFiber = yield* _(pipe(behaviour_({
                  entityId,
                  dequeue: queue.dequeue
                }), Effect.provideService(RecipientBehaviour.RecipientBehaviourContext, {
                  entityId,
                  recipientType: recipientType,
                  reply
                }), Effect.provide(env), Effect.ensuring(pipe(
                // remove from entityStates
                RefSynchronized.update(entityStates, HashMap.remove(entityId)),
                // shutdown the queue
                Effect.zipRight(queue.shutdown),
                // interrupt the expiration timer
                Effect.zipRight(Fiber.interrupt(expirationFiber)),
                // fail all pending reply channels with PodUnavailable
                Effect.zipRight(pipe(RefSynchronized.get(replyChannels), Effect.flatMap(Effect.forEach(([_, replyChannels]) => replyChannels.fail(Cause.fail(ShardingError.ShardingErrorEntityNotManagedByThisPod(entityId))))))))), Effect.forkDaemon));
                return [Option.some(queue), HashMap.set(map, entityId, EntityState.make({
                  messageQueue: Option.some(queue),
                  expirationFiber,
                  executionFiber,
                  replyChannels
                }))];
              });
            }
          }),
          onSome: entityState => pipe(entityState.messageQueue, Option.match({
            // queue exists, delay the interruption fiber and return the queue
            onSome: () => pipe(Fiber.interrupt(entityState.expirationFiber), Effect.zipRight(startExpirationFiber(entityId)), Effect.map(fiber => [entityState.messageQueue, HashMap.modify(map, entityId, EntityState.withExpirationFiber(fiber))])),
            // the queue is shutting down, stash and retry
            onNone: () => Effect.succeed([Option.none(), map])
          }))
        }));
      }
      return pipe(Effect.Do, Effect.tap(() => {
        // first, verify that this entity should be handled by this pod
        if (recipientType._tag === "EntityType") {
          return Effect.asUnit(Effect.unlessEffect(Effect.fail(ShardingError.ShardingErrorEntityNotManagedByThisPod(entityId)), sharding.isEntityOnLocalShards(recipientType, entityId)));
        } else if (recipientType._tag === "TopicType") {
          return Effect.unit;
        }
        return Effect.die("Unhandled recipientType");
      }), Effect.bind("test", () => RefSynchronized.modifyEffect(entityStates, map => decide(map, entityId))), Effect.flatMap(_ => {
        return pipe(_.test, Option.match({
          onNone: () => pipe(Effect.sleep(Duration.millis(100)), Effect.flatMap(() => send(entityId, req, replyId))),
          onSome: messageQueue => {
            return pipe(replyId, Option.match({
              onNone: () => pipe(messageQueue.offer(req), Effect.as(Option.none())),
              onSome: replyId_ => pipe(ReplyChannel.make(), Effect.tap(replyChannel => initReply(replyId_, replyChannel)), Effect.zipLeft(messageQueue.offer(req)), Effect.flatMap(_ => _.output))
            }));
          }
        }), Effect.unified);
      }));
    }
    const terminateAllEntities = pipe(RefSynchronized.get(entityStates), Effect.map(HashMap.keySet), Effect.flatMap(terminateEntities));
    function terminateEntities(entitiesToTerminate) {
      return pipe(entitiesToTerminate, Effect.forEach(entityId => pipe(forkEntityTermination(entityId), Effect.flatMap(Option.match({
        onNone: () => Effect.unit,
        onSome: executionFiber => pipe(Effect.logDebug("Waiting for shutdown of " + entityId), Effect.zipRight(Fiber.await(executionFiber)), Effect.timeout(config.entityTerminationTimeout), Effect.flatMap(Option.match({
          onNone: () => Effect.logError(`Entity ${recipientType.name + "#" + entityId} do not interrupted before entityTerminationTimeout (${Duration.toMillis(config.entityTerminationTimeout)}ms) . Are you sure that you properly handled PoisonPill message?`),
          onSome: () => Effect.logDebug(`Entity ${recipientType.name + "#" + entityId} cleaned up.`)
        })), Effect.asUnit)
      }))), {
        concurrency: "inherit"
      }), Effect.asUnit);
    }
    function terminateEntitiesOnShards(shards) {
      return pipe(RefSynchronized.modify(entityStates, entities => [HashMap.filter(entities, (_, entityId) => HashSet.has(shards, sharding.getShardId(recipientType, entityId))), entities]), Effect.map(HashMap.keySet), Effect.flatMap(terminateEntities));
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
//# sourceMappingURL=EntityManager.mjs.map