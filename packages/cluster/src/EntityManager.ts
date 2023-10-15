/**
 * @since 1.0.0
 */
import * as EntityState from "@effect/cluster/EntityState"
import type * as Message from "@effect/cluster/Message"
import * as MessageQueue from "@effect/cluster/MessageQueue"
import * as PoisonPill from "@effect/cluster/PoisonPill"
import type * as RecipientBehaviour from "@effect/cluster/RecipientBehaviour"
import type * as RecipientType from "@effect/cluster/RecipientType"
import type * as Replier from "@effect/cluster/Replier"
import * as ReplyChannel from "@effect/cluster/ReplyChannel"
import type * as ReplyId from "@effect/cluster/ReplyId"
import type * as ShardId from "@effect/cluster/ShardId"
import type * as Sharding from "@effect/cluster/Sharding"
import type * as ShardingConfig from "@effect/cluster/ShardingConfig"
import * as ShardingError from "@effect/cluster/ShardingError"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Fiber from "effect/Fiber"
import { pipe } from "effect/Function"
import * as HashMap from "effect/HashMap"
import * as HashSet from "effect/HashSet"
import * as Option from "effect/Option"
import * as Stream from "effect/Stream"
import * as RefSynchronized from "effect/SynchronizedRef"

/**
 * @since 1.0.0
 * @category models
 */
export interface EntityManager<Req> {
  readonly recipientType: RecipientType.RecipientType<Req>
  readonly send: <A extends Req>(
    entityId: string,
    req: A,
    replyId: Option.Option<ReplyId.ReplyId>
  ) => Effect.Effect<
    never,
    | ShardingError.ShardingErrorEntityNotManagedByThisPod
    | ShardingError.ShardingErrorPodUnavailable
    | ShardingError.ShardingErrorMessageQueue,
    Stream.Stream<
      never,
      ShardingError.ShardingError,
      Message.Success<A>
    >
  >
  readonly terminateEntitiesOnShards: (
    shards: HashSet.HashSet<ShardId.ShardId>
  ) => Effect.Effect<never, never, void>
  readonly terminateAllEntities: Effect.Effect<never, never, void>
}

/**
 * @since 1.0.0
 * @category constructors
 */
export function make<R, Req>(
  recipientType: RecipientType.RecipientType<Req>,
  behaviour_: RecipientBehaviour.RecipientBehaviour<R, Req>,
  sharding: Sharding.Sharding,
  config: ShardingConfig.ShardingConfig,
  options: RecipientBehaviour.EntityBehaviourOptions<Req> = {}
) {
  return Effect.gen(function*(_) {
    const entityMaxIdle = options.entityMaxIdleTime || Option.none()
    const messageQueueConstructor = options.messageQueueConstructor || MessageQueue.inMemory
    const env = yield* _(Effect.context<R>())
    const entityStates = yield* _(
      RefSynchronized.make<
        HashMap.HashMap<
          string,
          EntityState.EntityState<Req>
        >
      >(HashMap.empty())
    )
    const replyChannels = yield* _(RefSynchronized.make(
      HashMap.empty<ReplyId.ReplyId, ReplyChannel.ReplyChannel<any>>()
    ))
    const behaviour: RecipientBehaviour.RecipientBehaviour<never, Req> = (
      recipientContext
    ) => Effect.provide(behaviour_(recipientContext), env)

    function initReply(
      id: ReplyId.ReplyId,
      replyChannel: ReplyChannel.ReplyChannel<any>
    ): Effect.Effect<never, never, void> {
      return pipe(
        replyChannels,
        RefSynchronized.update(HashMap.set(id, replyChannel)),
        Effect.zipLeft(
          pipe(
            replyChannel.await,
            Effect.ensuring(RefSynchronized.update(replyChannels, HashMap.remove(id))),
            Effect.fork
          )
        )
      )
    }

    function reply<Reply>(reply: Reply, replier: Replier.Replier<Reply>): Effect.Effect<never, never, void> {
      return replyStream(Effect.succeed(reply), replier)
    }

    function replyStream<Reply>(
      replies: Stream.Stream<never, never, Reply>,
      replier: Replier.Replier<Reply>
    ): Effect.Effect<never, never, void> {
      return RefSynchronized.updateEffect(replyChannels, (repliers) =>
        pipe(
          Effect.suspend(() => {
            const replyChannel = HashMap.get(repliers, replier.id)

            if (Option.isSome(replyChannel)) {
              return (replyChannel.value as ReplyChannel.ReplyChannel<Reply>).replyStream(replies)
            }
            return Effect.unit
          }),
          Effect.as(pipe(repliers, HashMap.remove(replier.id)))
        ))
    }

    function startExpirationFiber(entityId: string) {
      return pipe(
        Effect.sleep(
          pipe(
            entityMaxIdle,
            Option.getOrElse(() => config.entityMaxIdleTime)
          )
        ),
        Effect.zipRight(forkEntityTermination(entityId)),
        Effect.asUnit,
        Effect.interruptible,
        Effect.forkDaemon
      )
    }

    /**
     * Begins entity termination (if needed) by sending the PoisonPill, return the fiber to wait for completed termination (if any)
     */
    function forkEntityTermination(entityId: string) {
      return RefSynchronized.modifyEffect(entityStates, (entityStatesMap) =>
        pipe(
          HashMap.get(entityStatesMap, entityId),
          Option.match({
            // if no entry is found, the entity has succefully shut down
            onNone: () => Effect.succeed([Option.none(), entityStatesMap] as const),
            // there is an entry, so we should begin termination
            onSome: (entityState) =>
              pipe(
                entityState.messageQueue,
                Option.match({
                  // termination has already begun, keep everything as-is
                  onNone: () => Effect.succeed([Option.some(entityState.executionFiber), entityStatesMap] as const),
                  // begin to terminate the queue
                  onSome: (queue) =>
                    pipe(
                      queue.offer(PoisonPill.make),
                      Effect.catchAllCause(Effect.logError),
                      Effect.as(
                        [
                          Option.some(entityState.executionFiber),
                          HashMap.modify(entityStatesMap, entityId, EntityState.withoutMessageQueue)
                        ] as const
                      )
                    )
                })
              )
          })
        ))
    }

    function send<A extends Req>(
      entityId: string,
      req: A,
      replyId: Option.Option<ReplyId.ReplyId>
    ): Effect.Effect<
      never,
      | ShardingError.ShardingErrorEntityNotManagedByThisPod
      | ShardingError.ShardingErrorPodUnavailable
      | ShardingError.ShardingErrorMessageQueue,
      Stream.Stream<
        never,
        ShardingError.ShardingError,
        Message.Success<A>
      >
    > {
      function decide(
        map: HashMap.HashMap<
          string,
          EntityState.EntityState<Req>
        >,
        entityId: string
      ) {
        return pipe(
          HashMap.get(map, entityId),
          Option.match({
            onNone: () =>
              Effect.flatMap(sharding.isShuttingDown, (isGoingDown) => {
                if (isGoingDown) {
                  // don't start any fiber while sharding is shutting down
                  return Effect.fail(ShardingError.ShardingErrorEntityNotManagedByThisPod(entityId))
                } else {
                  // queue doesn't exist, create a new one
                  return Effect.gen(function*(_) {
                    const queue = yield* _(pipe(
                      messageQueueConstructor(entityId),
                      Effect.provide(env)
                    ))
                    const expirationFiber = yield* _(startExpirationFiber(entityId))
                    const executionFiber = yield* _(
                      pipe(
                        behaviour({
                          entityId,
                          dequeue: queue.dequeue,
                          reply: (message, _) => reply(_, message.replier),
                          replyStream: (message, _) => replyStream(_, message.replier)
                        }),
                        Effect.ensuring(
                          pipe(
                            RefSynchronized.update(entityStates, HashMap.remove(entityId)),
                            Effect.zipRight(queue.shutdown),
                            Effect.zipRight(Fiber.interrupt(expirationFiber))
                          )
                        ),
                        Effect.forkDaemon
                      )
                    )
                    const replyChannels = yield* _(
                      RefSynchronized.make(HashMap.empty<ReplyId.ReplyId, ReplyChannel.ReplyChannel<any>>())
                    )

                    return [
                      Option.some(queue),
                      HashMap.set(
                        map,
                        entityId,
                        EntityState.make({
                          messageQueue: Option.some(queue),
                          expirationFiber,
                          executionFiber,
                          replyChannels
                        })
                      )
                    ] as const
                  })
                }
              }),
            onSome: (entityState) =>
              pipe(
                entityState.messageQueue,
                Option.match({
                  // queue exists, delay the interruption fiber and return the queue
                  onSome: () =>
                    pipe(
                      Fiber.interrupt(entityState.expirationFiber),
                      Effect.zipRight(startExpirationFiber(entityId)),
                      Effect.map(
                        (fiber) =>
                          [
                            entityState.messageQueue,
                            HashMap.modify(map, entityId, EntityState.withExpirationFiber(fiber))
                          ] as const
                      )
                    ),
                  // the queue is shutting down, stash and retry
                  onNone: () => Effect.succeed([Option.none(), map] as const)
                })
              )
          })
        )
      }

      return pipe(
        Effect.Do,
        Effect.tap(() => {
          // first, verify that this entity should be handled by this pod
          if (recipientType._tag === "EntityType") {
            return Effect.asUnit(Effect.unlessEffect(
              Effect.fail(ShardingError.ShardingErrorEntityNotManagedByThisPod(entityId)),
              sharding.isEntityOnLocalShards(recipientType, entityId)
            ))
          } else if (recipientType._tag === "TopicType") {
            return Effect.unit
          }
          return Effect.die("Unhandled recipientType")
        }),
        Effect.bind("test", () => RefSynchronized.modifyEffect(entityStates, (map) => decide(map, entityId))),
        Effect.flatMap((_) => {
          return pipe(
            _.test,
            Option.match({
              onNone: () =>
                pipe(
                  Effect.sleep(Duration.millis(100)),
                  Effect.flatMap(() => send(entityId, req, replyId))
                ),
              onSome: (messageQueue) => {
                return pipe(
                  replyId,
                  Option.match({
                    onNone: () =>
                      pipe(
                        messageQueue.offer(req),
                        Effect.as(Stream.empty)
                      ),
                    onSome: (replyId_) =>
                      pipe(
                        ReplyChannel.make<Message.Success<A>>(),
                        Effect.tap((replyChannel) => initReply(replyId_, replyChannel)),
                        Effect.zipLeft(messageQueue.offer(req)),
                        Effect.map((_) => _.output)
                      )
                  })
                )
              }
            }),
            Effect.unified
          )
        })
      )
    }

    const terminateAllEntities = pipe(
      RefSynchronized.get(entityStates),
      Effect.map(HashMap.keySet),
      Effect.flatMap(terminateEntities)
    )

    function terminateEntities(
      entitiesToTerminate: HashSet.HashSet<
        string
      >
    ) {
      return pipe(
        entitiesToTerminate,
        Effect.forEach(
          (entityId) =>
            pipe(
              forkEntityTermination(entityId),
              Effect.flatMap(Option.match({
                onNone: () => Effect.unit,
                onSome: (executionFiber) =>
                  pipe(
                    Effect.logDebug("Waiting for shutdown of " + entityId),
                    Effect.zipRight(Fiber.await(executionFiber)),
                    Effect.timeout(config.entityTerminationTimeout),
                    Effect.flatMap(Option.match({
                      onNone: () =>
                        Effect.logError(
                          `Entity ${
                            recipientType.name + "#" + entityId
                          } do not interrupted before entityTerminationTimeout (${
                            Duration.toMillis(config.entityTerminationTimeout)
                          }ms) . Are you sure that you properly handled PoisonPill message?`
                        ),
                      onSome: () =>
                        Effect.logDebug(
                          `Entity ${recipientType.name + "#" + entityId} cleaned up.`
                        )
                    })),
                    Effect.asUnit
                  )
              }))
            ),
          { concurrency: "inherit" }
        ),
        Effect.asUnit
      )
    }

    function terminateEntitiesOnShards(shards: HashSet.HashSet<ShardId.ShardId>) {
      return pipe(
        RefSynchronized.modify(entityStates, (entities) => [
          HashMap.filter(
            entities,
            (_, entityId) => HashSet.has(shards, sharding.getShardId(recipientType, entityId))
          ),
          entities
        ]),
        Effect.map(HashMap.keySet),
        Effect.flatMap(terminateEntities)
      )
    }

    const self: EntityManager<Req> = { recipientType, send, terminateAllEntities, terminateEntitiesOnShards }
    return self
  })
}
