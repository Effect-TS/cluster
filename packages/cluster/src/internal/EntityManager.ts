/** @internal */
import * as Cause from "effect/Cause"
import * as Clock from "effect/Clock"
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
import type * as Message from "../Message.js"
import * as RecipientBehaviour from "../RecipientBehaviour.js"
import type * as RecipientType from "../RecipientType.js"
import type * as ReplyId from "../ReplyId.js"
import type * as ShardId from "../ShardId.js"
import type * as Sharding from "../Sharding.js"
import type * as ShardingConfig from "../ShardingConfig.js"
import * as ShardingError from "../ShardingError.js"
import * as EntityState from "./entityState.js"
import * as ReplyChannel from "./replyChannel.js"

/** @internal */
const EntityManagerSymbolKey = "@effect/cluster/EntityManager"

/** @internal */
export const EntityManagerTypeId = Symbol.for(
  EntityManagerSymbolKey
)

/** @internal */
export type EntityManagerTypeId = typeof EntityManagerTypeId

/** @internal */
export interface EntityManager<Req> {
  readonly [EntityManagerTypeId]: EntityManagerTypeId

  /** @internal */
  readonly recipientType: RecipientType.RecipientType<Req>

  /** @internal */
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

  /** @internal */
  readonly terminateEntitiesOnShards: (
    shards: HashSet.HashSet<ShardId.ShardId>
  ) => Effect.Effect<never, never, void>

  /** @internal */
  readonly terminateAllEntities: Effect.Effect<never, never, void>
}

/** @internal */
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
      const maxIdleMillis = pipe(
        entityMaxIdle,
        Option.getOrElse(() => config.entityMaxIdleTime),
        Duration.toMillis
      )

      function sleep(duration: number): Effect.Effect<never, never, void> {
        return pipe(
          Effect.Do,
          Effect.zipLeft(Clock.sleep(Duration.millis(duration))),
          Effect.bind("cdt", () => Clock.currentTimeMillis),
          Effect.bind("map", () => RefSynchronized.get(entityStates)),
          Effect.let("lastReceivedAt", ({ map }) =>
            pipe(
              HashMap.get(map, entityId),
              Option.map((_) => _.lastReceivedAt),
              Option.getOrElse(() => 0)
            )),
          Effect.let("remaining", ({ cdt, lastReceivedAt }) => (maxIdleMillis - cdt + lastReceivedAt)),
          Effect.tap((_) => _.remaining > 0 ? sleep(_.remaining) : Effect.unit)
        )
      }

      return pipe(
        sleep(maxIdleMillis),
        Effect.zipLeft(
          Effect.logDebug("Entity did not receive new messages, termination starting....")
        ),
        Effect.zipRight(forkEntityTermination(entityId)),
        Effect.asUnit,
        Effect.interruptible,
        Effect.annotateLogs("entityId", entityId),
        Effect.annotateLogs("recipientType", recipientType.name),
        Effect.forkDaemon
      )
    }

    /**
     * Performs proper termination of the entity, interrupting the expiration timer, closing the scope and failing pending replies
     */
    function terminateEntity(entityId: string) {
      return pipe(
        // get the things to cleanup
        RefSynchronized.get(
          entityStates
        ),
        Effect.map(HashMap.get(entityId)),
        Effect.flatMap(Option.match({
          // there is no entity state to cleanup
          onNone: () => Effect.unit,
          // found it!
          onSome: (entityState) =>
            pipe(
              Effect.logDebug("Termination started..."),
              // interrupt the expiration timer
              Effect.ensuring(Fiber.interrupt(entityState.expirationFiber)),
              // close the scope of the entity,
              Effect.zipRight(Effect.logDebug("Closing scope...")),
              Effect.ensuring(Scope.close(entityState.executionScope, Exit.unit)),
              Effect.zipRight(Effect.logDebug("Closing replyChannels...")),
              // fail all pending reply channels with PodUnavailable
              Effect.ensuring(pipe(
                RefSynchronized.get(entityState.replyChannels),
                Effect.flatMap(Effect.forEach(([_, replyChannels]) =>
                  replyChannels.fail(
                    Cause.fail(ShardingError.ShardingErrorEntityNotManagedByThisPod(entityId))
                  )
                ))
              )),
              // remove the entry from the map
              Effect.zipRight(Effect.logDebug("Removing entityState from map...")),
              Effect.ensuring(RefSynchronized.update(entityStates, HashMap.remove(entityId))),
              // log error if happens
              Effect.catchAllCause(Effect.logError),
              Effect.asUnit,
              Effect.zipRight(Effect.logDebug("Terminated.")),
              Effect.annotateLogs("entityId", entityId),
              Effect.annotateLogs("recipientType", recipientType.name)
            )
        }))
      )
    }

    /**
     * Begins entity termination (if needed) and return the fiber to wait for completed termination (if any)
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
                      terminateEntity(entityId),
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

    function getOrCreateEntityState(
      entityId: string
    ): Effect.Effect<
      never,
      ShardingError.ShardingErrorEntityNotManagedByThisPod,
      Option.Option<EntityState.EntityState<Req>>
    > {
      return RefSynchronized.modifyEffect(entityStates, (map) =>
        pipe(
          HashMap.get(map, entityId),
          Option.match({
            onSome: (entityState) =>
              pipe(
                entityState.terminationFiber,
                Option.match({
                  // offer exists, delay the interruption fiber and return the offer
                  onNone: () =>
                    pipe(
                      Clock.currentTimeMillis,
                      Effect.map(
                        (cdt) =>
                          [
                            Option.some(entityState),
                            HashMap.modify(map, entityId, EntityState.withLastReceivedAd(cdt))
                          ] as const
                      )
                    ),
                  // the queue is shutting down, stash and retry
                  onSome: () => Effect.succeed([Option.none(), map] as const)
                })
              ),
            onNone: () =>
              Effect.flatMap(sharding.isShuttingDown, (isGoingDown) => {
                if (isGoingDown) {
                  // don't start any fiber while sharding is shutting down
                  return Effect.fail(ShardingError.ShardingErrorEntityNotManagedByThisPod(entityId))
                } else {
                  // offer doesn't exist, create a new one
                  return Effect.gen(function*(_) {
                    const executionScope = yield* _(Scope.make())
                    const expirationFiber = yield* _(startExpirationFiber(entityId))
                    const cdt = yield* _(Clock.currentTimeMillis)
                    const replyChannels = yield* _(
                      RefSynchronized.make(HashMap.empty<ReplyId.ReplyId, ReplyChannel.ReplyChannel<any>>())
                    )

                    const offer = yield* _(pipe(
                      behaviour_(entityId),
                      Scope.extend(executionScope),
                      Effect.provideService(RecipientBehaviour.RecipientBehaviourContext, {
                        entityId,
                        reply: (replyId, reply) => sendReply(replyId, reply, replyChannels)
                      }),
                      Effect.provide(env)
                    ))

                    const entityState = EntityState.make({
                      offer,
                      expirationFiber,
                      executionScope,
                      replyChannels,
                      terminationFiber: Option.none(),
                      lastReceivedAt: cdt
                    })

                    return [
                      Option.some(entityState),
                      HashMap.set(
                        map,
                        entityId,
                        entityState
                      )
                    ] as const
                  })
                }
              })
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
        Effect.bind("maybeEntityState", () => getOrCreateEntityState(entityId)),
        Effect.flatMap((_) =>
          pipe(
            _.maybeEntityState,
            Option.match({
              onNone: () =>
                pipe(
                  Effect.sleep(Duration.millis(100)),
                  Effect.flatMap(() => send(entityId, req, replyId))
                ),
              onSome: (entityState) => {
                return pipe(
                  replyId,
                  Option.match({
                    onNone: () =>
                      pipe(
                        entityState.offer(req),
                        Effect.as(Option.none())
                      ),
                    onSome: (replyId_) =>
                      pipe(
                        ReplyChannel.make<Message.Success<A>>(),
                        Effect.tap((replyChannel) => initReply(replyId_, replyChannel, entityState.replyChannels)),
                        Effect.zipLeft(entityState.offer(req)),
                        Effect.flatMap((_) => _.output)
                      )
                  })
                )
              }
            })
          )
        )
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
                    Fiber.await(terminationFiber),
                    Effect.timeout(config.entityTerminationTimeout),
                    Effect.flatMap(Option.match({
                      onNone: () =>
                        Effect.logError(
                          `Entity ${
                            recipientType.name + "#" + entityId
                          } termination is taking more than expected entityTerminationTimeout (${
                            Duration.toMillis(config.entityTerminationTimeout)
                          }ms).`
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

    const self: EntityManager<Req> = {
      [EntityManagerTypeId]: EntityManagerTypeId,
      recipientType,
      send,
      terminateAllEntities,
      terminateEntitiesOnShards
    }
    return self
  })
}
