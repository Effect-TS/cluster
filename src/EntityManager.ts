import * as Option from "@fp-ts/data/Option";
import * as Deferred from "@effect/io/Deferred";
import * as Queue from "@effect/io/Queue";
import * as Effect from "@effect/io/Effect";
import * as ShardError from "./ShardError";
import * as HashSet from "@fp-ts/data/HashSet";
import * as HashMap from "@fp-ts/data/HashMap";
import * as RecipientType from "./RecipientType";
import { ShardId } from "./ShardId";
import * as Sharding from "./Sharding";
import * as Config from "./Config";
import * as Duration from "@fp-ts/data/Duration";
import * as RefSynchronized from "@effect/io/Ref/Synchronized";
import * as Fiber from "@effect/io/Fiber";
import { pipe } from "@fp-ts/data/Function";
import { duration } from "@fp-ts/data";

export interface EntityManager<Req> {
  send(
    entityId: string,
    req: Req,
    replyId: Option.Option<string>,
    promise: Deferred.Deferred<ShardError.Throwable, Option.Option<any>>
  ): Effect.Effect<never, ShardError.EntityNotManagedByThisPod, void>;
  terminateEntitiesOnShards(shards: HashSet.HashSet<ShardId>): Effect.Effect<never, never, void>;
  terminateAllEntities: Effect.Effect<never, never, void>;
}

export function make<R, Req>(
  recipientType: RecipientType.RecipentType<Req>,
  behavior_: (entityId: string, dequeue: Queue.Dequeue<Req>) => Effect.Effect<R, never, void>,
  terminateMessage: (p: Deferred.Deferred<never, void>) => Option.Option<Req>,
  sharding: Sharding.Sharding,
  config: Config.Config,
  entityMaxIdle: Option.Option<Duration.Duration>
) {
  return Effect.gen(function* ($) {
    const entities = yield* $(
      RefSynchronized.make<
        HashMap.HashMap<
          string,
          readonly [Option.Option<Queue.Queue<Req>>, Fiber.RuntimeFiber<never, void>]
        >
      >(HashMap.empty())
    );
    const env = yield* $(Effect.environment<R>());
    const behavior = (entityId: string, dequeue: Queue.Dequeue<Req>) =>
      pipe(behavior_(entityId, dequeue), Effect.provideEnvironment(env));

    function startExpirationFiber(entityId: string) {
      return pipe(
        Effect.sleep(
          pipe(
            entityMaxIdle,
            Option.getOrElse(() => config.entityMaxIdleTime)
          )
        ),
        Effect.zipRight(pipe(terminateEntity(entityId), Effect.forkDaemon, Effect.unit)),
        Effect.forkDaemon
      );
    }

    function terminateEntity(entityId: string) {
      return pipe(
        entities,
        RefSynchronized.updateEffect((map) => {
          const _ = pipe(
            map,
            HashMap.get(entityId),
            Option.match(
              // if no queue is found, do nothing
              () => Effect.succeed(map),
              ([maybeQueue, interruptionFiber]) =>
                pipe(
                  maybeQueue,
                  Option.match(
                    () => Effect.succeed(map),
                    (queue) =>
                      pipe(
                        Deferred.make<never, void>(),
                        Effect.flatMap((p) =>
                          pipe(
                            terminateMessage(p),
                            Option.match(
                              () =>
                                pipe(
                                  Queue.shutdown(queue),
                                  Effect.as(pipe(map, HashMap.remove(entityId)))
                                ),
                              // if a queue is found, offer the termination message, and set the queue to None so that no new message is enqueued
                              (msg) =>
                                pipe(
                                  queue,
                                  Queue.offer(msg),
                                  Effect.exit,
                                  Effect.as(
                                    pipe(
                                      map,
                                      HashMap.set(entityId, [
                                        Option.none as Option.Option<Queue.Queue<Req>>,
                                        interruptionFiber,
                                      ] as const)
                                    )
                                  )
                                )
                            )
                          )
                        )
                      )
                  )
                )
            )
          );
          return _;
        })
      );
    }

    function send(
      entityId: string,
      req: Req,
      replyId: Option.Option<string>,
      promise: Deferred.Deferred<ShardError.Throwable, Option.Option<any>>
    ): Effect.Effect<never, ShardError.EntityNotManagedByThisPod, void> {
      console.log("send called for", entityId);
      function decide(
        map: HashMap.HashMap<
          string,
          readonly [Option.Option<Queue.Queue<Req>>, Fiber.RuntimeFiber<never, void>]
        >,
        entityId: string
      ) {
        const test = pipe(map, HashMap.get(entityId));
        if (Option.isSome(test) && Option.isSome(test.value[0])) {
          const [queue, interruptionFiber] = test.value;
          // queue exists, delay the interruption fiber and return the queue
          return pipe(
            Fiber.interrupt(interruptionFiber),
            Effect.zipRight(startExpirationFiber(entityId)),
            Effect.map(
              (fiber) =>
                [
                  queue,
                  pipe(
                    map,
                    HashMap.set(entityId, [
                      queue as Option.Option<Queue.Queue<Req>>,
                      fiber,
                    ] as const)
                  ),
                ] as const
            )
          );
        } else if (Option.isSome(test) && Option.isNone(test.value[0])) {
          // the queue is shutting down, stash and retry
          return Effect.succeed([Option.none, map] as const);
        } else {
          return pipe(
            sharding.isShuttingDown,
            Effect.flatMap((isGoingDown) => {
              if (isGoingDown) {
                // don't start any fiber while sharding is shutting down
                return Effect.fail(ShardError.EntityNotManagedByThisPod(entityId));
              } else {
                // queue doesn't exist, create a new one
                return pipe(
                  Effect.Do(),
                  Effect.bind("queue", () => Queue.unbounded<Req>()),
                  Effect.bind("expirationFiber", () => startExpirationFiber(entityId)),
                  Effect.tap((_) =>
                    pipe(
                      behavior(entityId, _.queue),
                      Effect.ensuring(
                        pipe(
                          entities,
                          RefSynchronized.update(HashMap.remove(entityId)),
                          Effect.zipRight(Queue.shutdown(_.queue)),
                          Effect.zipRight(Fiber.interrupt(_.expirationFiber))
                        )
                      ),
                      Effect.forkDaemon
                    )
                  ),
                  Effect.bindValue("someQueue", (_) => Option.some(_.queue)),
                  Effect.map(
                    (_) =>
                      [
                        _.someQueue,
                        pipe(
                          map,
                          HashMap.set(entityId, [
                            _.someQueue as Option.Option<Queue.Queue<Req>>,
                            _.expirationFiber,
                          ] as const)
                        ),
                      ] as const
                  )
                );
              }
            })
          );
        }
      }

      return pipe(
        Effect.Do(),
        Effect.tap(() => {
          // first, verify that this entity should be handled by this pod
          if (recipientType._tag === "EntityType") {
            return Effect.unlessEffect(sharding.isEntityOnLocalShards(recipientType, entityId))(
              Effect.fail(ShardError.EntityNotManagedByThisPod(entityId))
            );
          }

          return Effect.unit();
        }),
        Effect.bind("test", () => entities.modifyEffect((map) => decide(map, entityId))),
        Effect.tap((_) =>
          pipe(
            _.test,
            Option.match(
              () =>
                pipe(
                  Effect.sleep(duration.millis(100)),
                  Effect.zipRight(send(entityId, req, replyId, promise))
                ),
              (queue) => {
                return pipe(
                  replyId,
                  Option.match(
                    () =>
                      pipe(queue, Queue.offer(req), Effect.zipLeft(Effect.succeed(Option.none))),
                    (replyId_) =>
                      pipe(
                        sharding.initReply(replyId_, promise),
                        Effect.zipRight(pipe(queue, Queue.offer(req)))
                      )
                  ),
                  Effect.catchAllCause((cause) => send(entityId, req, replyId, promise))
                );
              }
            )
          )
        )
      );
    }

    const terminateAllEntities = pipe(
      entities,
      RefSynchronized.getAndSet(HashMap.empty()),
      Effect.flatMap(terminateEntities)
    );

    function terminateEntities(
      entitiesToTerminate: HashMap.HashMap<
        string,
        readonly [Option.Option<Queue.Queue<Req>>, Fiber.RuntimeFiber<never, void>]
      >
    ) {
      return pipe(
        entitiesToTerminate,
        Effect.forEach(([_, [queue_, __]]) => {
          return pipe(
            Deferred.make<never, boolean>(),
            Effect.tap((p) =>
              pipe(
                queue_,
                Option.match(
                  () => pipe(p, Deferred.succeed(true)),
                  (queue) =>
                    pipe(
                      terminateMessage(p),
                      Option.match(
                        () =>
                          pipe(
                            Queue.shutdown(queue),
                            Effect.zipRight(pipe(p, Deferred.succeed(true)))
                          ),
                        (terminate) =>
                          pipe(
                            queue,
                            Queue.offer(terminate),
                            Effect.catchAllCause(() => pipe(p, Deferred.succeed(true)))
                          )
                      )
                    )
                )
              )
            )
          );
        }),
        Effect.flatMap((promises) =>
          pipe(
            promises,
            Effect.forEachDiscard(Deferred.await),
            Effect.timeout(config.entityTerminationTimeout)
          )
        )
      );
    }

    function terminateEntitiesOnShards(shards: HashSet.HashSet<ShardId>) {
      return Effect.unit();
    }

    /**
def terminateEntitiesOnShards(shards: Set[ShardId]): UIO[Unit] =
      entities.modify { entities =>
        // get all entities on the given shards to terminate them
        entities.partition { case (entityId, _) => shards.contains(sharding.getShardId(recipientType, entityId)) }
      }
        .flatMap(terminateEntities)
     */

    const self: EntityManager<Req> = { send, terminateAllEntities, terminateEntitiesOnShards };
    return self;
  });
}
