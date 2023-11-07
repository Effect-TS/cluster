/**
 * @since 1.0.0
 */
import * as EntityState from "@effect/cluster/EntityState"
import type * as Message from "@effect/cluster/Message"
import * as RecipientBehaviour from "@effect/cluster/RecipientBehaviour"
import type * as RecipientType from "@effect/cluster/RecipientType"
import * as ReplyChannel from "@effect/cluster/ReplyChannel"
import type * as ReplyId from "@effect/cluster/ReplyId"
import type * as ShardId from "@effect/cluster/ShardId"
import type * as Sharding from "@effect/cluster/Sharding"
import type * as ShardingConfig from "@effect/cluster/ShardingConfig"
import * as ShardingError from "@effect/cluster/ShardingError"
import * as Cause from "effect/Cause"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as Fiber from "effect/Fiber"
import { pipe } from "effect/Function"
import * as HashMap from "effect/HashMap"
import * as HashSet from "effect/HashSet"
import * as Option from "effect/Option"
import * as Scope from "effect/Scope"
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
    Option.Option<
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
  options: RecipientBehaviour.EntityBehaviourOptions = {}
) {
  return Effect.gen(function*(_) {
    const entityMaxIdle = options.entityMaxIdleTime || Option.none()
    const env = yield* _(Effect.context<Exclude<R, RecipientBehaviour.RecipientBehaviourContext>>())
    const entityStates = yield* _(
      RefSynchronized.make<
        HashMap.HashMap<
          string,
          EntityState.EntityState<Req>
        >
      >(HashMap.empty())
    )
    const replyChannels = yield* _(
      RefSynchronized.make(HashMap.empty<ReplyId.ReplyId, ReplyChannel.ReplyChannel<any>>())
    )

    function initReply(
      id: ReplyId.ReplyId,
      replyChannel: ReplyChannel.ReplyChannel<any>,
      replyChannels: EntityState.EntityState<Req>["replyChannels"]
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

    function sendReply<Reply>(
      replyId: ReplyId.ReplyId,
      reply: Reply,
      replyChannels: EntityState.EntityState<Req>["replyChannels"]
    ): Effect.Effect<never, never, void> {
      return RefSynchronized.updateEffect(replyChannels, (repliers) =>
        pipe(
          Effect.suspend(() => {
            const replyChannel = HashMap.get(repliers, replyId)

            if (Option.isSome(replyChannel)) {
              return (replyChannel.value as ReplyChannel.ReplyChannel<Reply>).reply(reply)
            }
            return Effect.unit
          }),
          Effect.as(pipe(repliers, HashMap.remove(replyId)))
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
    function forkEntityTermination(
      entityId: string
    ): Effect.Effect<never, never, Option.Option<Fiber.RuntimeFiber<never, void>>> {
      return RefSynchronized.modifyEffect(entityStates, (entityStatesMap) =>
        pipe(
          HashMap.get(entityStatesMap, entityId),
          Option.match({
            // if no entry is found, the entity has succefully shut down
            onNone: () => Effect.succeed([Option.none(), entityStatesMap] as const),
            // there is an entry, so we should begin termination
            onSome: (entityState) =>
              pipe(
                entityState.terminationFiber,
                Option.match({
                  // termination has already begun, keep everything as-is
                  onSome: () => Effect.succeed([entityState.terminationFiber, entityStatesMap] as const),
                  // begin to terminate the queue
                  onNone: () =>
                    pipe(
                      Scope.close(entityState.executionScope, Exit.unit),
                      Effect.catchAllCause(Effect.logError),
                      Effect.forkDaemon,
                      Effect.map((terminationFiber) =>
                        [
                          Option.some(terminationFiber),
                          HashMap.modify(entityStatesMap, entityId, EntityState.withTerminationFiber(terminationFiber))
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
      Option.Option<
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
                    const executionScope = yield* _(Scope.make())
                    const expirationFiber = yield* _(startExpirationFiber(entityId))

                    const offer = yield* _(pipe(
                      Effect.acquireRelease(
                        behaviour_(entityId),
                        () =>
                          pipe(
                            RefSynchronized.modify(
                              entityStates,
                              (map) => [HashMap.get(map, entityId), HashMap.remove(map, entityId)] as const
                            ),
                            Effect.flatMap(Option.match({
                              onNone: () => Effect.unit,
                              onSome: (entityState) =>
                                pipe(
                                  // interrupt the expiration timer
                                  Fiber.interrupt(entityState.expirationFiber),
                                  // fail all pending reply channels with PodUnavailable
                                  Effect.zipRight(pipe(
                                    RefSynchronized.get(entityState.replyChannels),
                                    Effect.flatMap(Effect.forEach(([_, replyChannels]) =>
                                      replyChannels.fail(
                                        Cause.fail(ShardingError.ShardingErrorEntityNotManagedByThisPod(entityId))
                                      )
                                    ))
                                  ))
                                )
                            }))
                          )
                      ),
                      Effect.provideService(RecipientBehaviour.RecipientBehaviourContext, {
                        entityId,
                        reply: (replyId, reply) => sendReply(replyId, reply, replyChannels)
                      }),
                      Effect.provide(env),
                      Scope.extend(executionScope)
                    ))

                    return [
                      Option.some(offer),
                      HashMap.set(
                        map,
                        entityId,
                        EntityState.make({
                          offer,
                          expirationFiber,
                          executionScope,
                          replyChannels,
                          terminationFiber: Option.none()
                        })
                      )
                    ] as const
                  })
                }
              }),
            onSome: (entityState) =>
              pipe(
                entityState.terminationFiber,
                Option.match({
                  // offer exists, delay the interruption fiber and return the offer
                  onNone: () =>
                    pipe(
                      Fiber.interrupt(entityState.expirationFiber),
                      Effect.zipRight(startExpirationFiber(entityId)),
                      Effect.map(
                        (fiber) =>
                          [
                            Option.some(entityState.offer),
                            HashMap.modify(map, entityId, EntityState.withExpirationFiber(fiber))
                          ] as const
                      )
                    ),
                  // the queue is shutting down, stash and retry
                  onSome: () => Effect.succeed([Option.none(), map] as const)
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
              onSome: (offer) => {
                return pipe(
                  replyId,
                  Option.match({
                    onNone: () =>
                      pipe(
                        offer(req),
                        Effect.as(Option.none())
                      ),
                    onSome: (replyId_) =>
                      pipe(
                        ReplyChannel.make<Message.Success<A>>(),
                        Effect.tap((replyChannel) => initReply(replyId_, replyChannel, replyChannels)),
                        Effect.zipLeft(offer(req)),
                        Effect.flatMap((_) => _.output)
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
                onSome: (terminationFiber) =>
                  pipe(
                    Effect.logDebug("Waiting for shutdown of " + entityId),
                    Effect.zipRight(Fiber.await(terminationFiber)),
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
