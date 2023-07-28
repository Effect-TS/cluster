/**
 * @since 1.0.0
 */
import * as Duration from "@effect/data/Duration"
import { pipe } from "@effect/data/Function"
import * as HashMap from "@effect/data/HashMap"
import * as HashSet from "@effect/data/HashSet"
import * as Option from "@effect/data/Option"
import * as Effect from "@effect/io/Effect"
import * as Fiber from "@effect/io/Fiber"
import * as Queue from "@effect/io/Queue"
import * as RefSynchronized from "@effect/io/Ref/Synchronized"
import * as PoisonPill from "@effect/shardcake/PoisonPill"
import type * as RecipientType from "@effect/shardcake/RecipientType"
import type * as ReplyChannel from "@effect/shardcake/ReplyChannel"
import type * as ReplyId from "@effect/shardcake/ReplyId"
import * as ShardError from "@effect/shardcake/ShardError"
import type * as ShardId from "@effect/shardcake/ShardId"
import type * as Sharding from "@effect/shardcake/Sharding"
import type * as ShardingConfig from "@effect/shardcake/ShardingConfig"

/**
 * @since 1.0.0
 * @category models
 */
export interface EntityManager<Req> {
  send(
    entityId: string,
    req: Req,
    replyId: Option.Option<ReplyId.ReplyId>,
    replyChannel: ReplyChannel.ReplyChannel<any>
  ): Effect.Effect<never, ShardError.EntityNotManagedByThisPod, void>
  terminateEntitiesOnShards(
    shards: HashSet.HashSet<ShardId.ShardId>
  ): Effect.Effect<never, never, void>
  terminateAllEntities: Effect.Effect<never, never, void>
}

type EntityManagerEntry<Req> = readonly [
  messageQueue: Option.Option<Queue.Queue<Req | PoisonPill.PoisonPill>>,
  expirationFiber: Fiber.RuntimeFiber<never, void>,
  executionFiber: Fiber.RuntimeFiber<never, void>
]

/**
 * @since 1.0.0
 * @category constructors
 */
export function make<R, Req>(
  recipientType: RecipientType.RecipientType<Req>,
  behavior_: (
    entityId: string,
    dequeue: Queue.Dequeue<Req | PoisonPill.PoisonPill>
  ) => Effect.Effect<R, never, void>,
  sharding: Sharding.Sharding,
  config: ShardingConfig.ShardingConfig,
  entityMaxIdle: Option.Option<Duration.Duration>
) {
  return Effect.gen(function*($) {
    const entities = yield* $(
      RefSynchronized.make<
        HashMap.HashMap<
          string,
          EntityManagerEntry<Req>
        >
      >(HashMap.empty())
    )
    const env = yield* $(Effect.context<R>())
    const behavior = (
      entityId: string,
      dequeue: Queue.Dequeue<Req | PoisonPill.PoisonPill>
    ) => Effect.provideContext(behavior_(entityId, dequeue), env)

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

    function forkEntityTermination(entityId: string) {
      return RefSynchronized.modifyEffect(entities, (map) =>
        pipe(
          HashMap.get(map, entityId),
          Option.match({
            // if no entry is found, the entity has succefully shut down
            onNone: () => Effect.succeed([Option.none(), map] as const),
            // there is an entry, so we should begin termination
            onSome: ([maybeQueue, expirationFiber, runningFiber]) =>
              pipe(
                maybeQueue,
                Option.match({
                  // termination has already begun, keep everything as-is
                  onNone: () => Effect.succeed([Option.some(runningFiber), map] as const),
                  // begin to terminate the queue
                  onSome: (queue) =>
                    pipe(
                      Queue.offer(queue, PoisonPill.make),
                      Effect.as(
                        [
                          Option.some(runningFiber),
                          HashMap.set(map, entityId, [
                            Option.none(),
                            expirationFiber,
                            runningFiber
                          ])
                        ] as const
                      )
                    )
                })
              )
          })
        ))
    }

    function send(
      entityId: string,
      req: Req,
      replyId: Option.Option<ReplyId.ReplyId>,
      replyChannel: ReplyChannel.ReplyChannel<any>
    ): Effect.Effect<never, ShardError.EntityNotManagedByThisPod, void> {
      function decide(
        map: HashMap.HashMap<
          string,
          EntityManagerEntry<Req>
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
                  return Effect.fail(ShardError.EntityNotManagedByThisPod(entityId))
                } else {
                  // queue doesn't exist, create a new one
                  return Effect.gen(function*(_) {
                    const queue = yield* _(Queue.unbounded<Req | PoisonPill.PoisonPill>())
                    const expirationFiber = yield* _(startExpirationFiber(entityId))
                    const executionFiber = yield* _(
                      pipe(
                        behavior(entityId, queue),
                        Effect.ensuring(
                          pipe(
                            RefSynchronized.update(entities, HashMap.remove(entityId)),
                            Effect.zipRight(Queue.shutdown(queue)),
                            Effect.zipRight(Fiber.interrupt(expirationFiber))
                          )
                        ),
                        Effect.forkDaemon
                      )
                    )

                    const someQueue = Option.some(queue)
                    return [
                      someQueue,
                      HashMap.set(map, entityId, [someQueue, expirationFiber, executionFiber] as const)
                    ] as const
                  })
                }
              }),
            onSome: ([maybeQueue, interruptionFiber, executionFiber]) =>
              pipe(
                maybeQueue,
                Option.match({
                  // queue exists, delay the interruption fiber and return the queue
                  onSome: () =>
                    pipe(
                      Fiber.interrupt(interruptionFiber),
                      Effect.zipRight(startExpirationFiber(entityId)),
                      Effect.map(
                        (fiber) =>
                          [
                            maybeQueue,
                            HashMap.set(map, entityId, [maybeQueue, fiber, executionFiber] as const)
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
            return Effect.unlessEffect(
              Effect.fail(ShardError.EntityNotManagedByThisPod(entityId)),
              sharding.isEntityOnLocalShards(recipientType, entityId)
            )
          } else if (recipientType._tag === "TopicType") {
            return Effect.unit
          }
          return Effect.die("Unhandled recipientType")
        }),
        Effect.bind("test", () => RefSynchronized.modifyEffect(entities, (map) => decide(map, entityId))),
        Effect.tap((_) =>
          pipe(
            _.test,
            Option.match({
              onNone: () =>
                pipe(
                  Effect.sleep(Duration.millis(100)),
                  Effect.zipRight(send(entityId, req, replyId, replyChannel))
                ),
              onSome: (queue) => {
                return pipe(
                  replyId,
                  Option.match({
                    onNone: () =>
                      Effect.zipLeft(
                        Queue.offer(queue, req),
                        replyChannel.end
                      ),
                    onSome: (replyId_) =>
                      Effect.zipRight(
                        sharding.initReply(replyId_, replyChannel),
                        Queue.offer(queue, req)
                      )
                  }),
                  Effect.catchAllCause((e) =>
                    pipe(
                      Effect.logDebug("Send failed with the following cause:", e),
                      Effect.zipRight(send(entityId, req, replyId, replyChannel))
                    )
                  )
                )
              }
            })
          )
        )
      )
    }

    const terminateAllEntities = pipe(
      RefSynchronized.get(entities),
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
                    Fiber.await(executionFiber),
                    Effect.timeout(config.entityTerminationTimeout),
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
        RefSynchronized.modify(entities, (entities) => [
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

    const self: EntityManager<Req> = { send, terminateAllEntities, terminateEntitiesOnShards }
    return self
  })
}
