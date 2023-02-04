import * as Option from "@fp-ts/core/Option";
import * as Deferred from "@effect/io/Deferred";
import * as Queue from "@effect/io/Queue";
import * as Effect from "@effect/io/Effect";
import * as ShardError from "./ShardError";
import * as HashSet from "@fp-ts/data/HashSet";
import * as HashMap from "@fp-ts/data/HashMap";
import * as RecipientType from "./RecipientType";
import * as ShardId from "./ShardId";
import * as Sharding from "./Sharding";
import * as Config from "./Config";
import * as Duration from "@fp-ts/data/Duration";
import * as RefSynchronized from "@effect/io/Ref/Synchronized";
import * as Fiber from "@effect/io/Fiber";
import { pipe } from "@fp-ts/core/Function";
import { duration } from "@fp-ts/data";

export interface EntityManager<Req> {
  send(
    entityId: string,
    req: Req,
    replyId: Option.Option<string>,
    promise: Deferred.Deferred<ShardError.Throwable, Option.Option<any>>
  ): Effect.Effect<never, ShardError.EntityNotManagedByThisPod, void>;
  terminateEntitiesOnShards(
    shards: HashSet.HashSet<ShardId.ShardId>
  ): Effect.Effect<never, never, void>;
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
    const env = yield* $(Effect.context<R>());
    const behavior = (entityId: string, dequeue: Queue.Dequeue<Req>) =>
      Effect.provideContext(behavior_(entityId, dequeue), env);

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
      return RefSynchronized.updateEffect(entities, (map) => {
        const _ = pipe(
          HashMap.get(map, entityId),
          Option.match(
            // if no queue is found, do nothing
            () => Effect.succeed(map),
            ([maybeQueue, interruptionFiber]) =>
              pipe(
                maybeQueue,
                Option.match(
                  () => Effect.succeed(map),
                  (queue) =>
                    Effect.flatMap(Deferred.make<never, void>(), (p) =>
                      pipe(
                        terminateMessage(p),
                        Option.match(
                          () => Effect.as(Queue.shutdown(queue), HashMap.remove(map, entityId)),
                          // if a queue is found, offer the termination message, and set the queue to None so that no new message is enqueued
                          (msg) =>
                            Effect.as(
                              pipe(Queue.offer(queue, msg), Effect.exit),
                              HashMap.set(map, entityId, [
                                Option.none(),
                                interruptionFiber,
                              ] as const)
                            )
                        )
                      )
                    )
                )
              )
          )
        );
        return _;
      });
    }

    function send(
      entityId: string,
      req: Req,
      replyId: Option.Option<string>,
      promise: Deferred.Deferred<ShardError.Throwable, Option.Option<any>>
    ): Effect.Effect<never, ShardError.EntityNotManagedByThisPod, void> {
      function decide(
        map: HashMap.HashMap<
          string,
          readonly [Option.Option<Queue.Queue<Req>>, Fiber.RuntimeFiber<never, void>]
        >,
        entityId: string
      ) {
        const test = HashMap.get(map, entityId);
        if (Option.isSome(test) && Option.isSome(test.value[0])) {
          const [queue, interruptionFiber] = test.value;
          // queue exists, delay the interruption fiber and return the queue
          return pipe(
            Fiber.interrupt(interruptionFiber),
            Effect.zipRight(startExpirationFiber(entityId)),
            Effect.map(
              (fiber) => [queue, HashMap.set(map, entityId, [queue, fiber] as const)] as const
            )
          );
        } else if (Option.isSome(test) && Option.isNone(test.value[0])) {
          // the queue is shutting down, stash and retry
          return Effect.succeed([Option.none(), map] as const);
        } else {
          return Effect.flatMap(sharding.isShuttingDown, (isGoingDown) => {
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
                        RefSynchronized.update(entities, HashMap.remove(entityId)),
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
                      HashMap.set(map, entityId, [_.someQueue, _.expirationFiber] as const),
                    ] as const
                )
              );
            }
          });
        }
      }

      return pipe(
        Effect.Do(),
        Effect.tap(() => {
          // first, verify that this entity should be handled by this pod
          if (recipientType._tag === "EntityType") {
            return Effect.unlessEffect(
              Effect.fail(ShardError.EntityNotManagedByThisPod(entityId)),
              sharding.isEntityOnLocalShards(recipientType, entityId)
            );
          } else if (recipientType._tag === "TopicType") {
            return Effect.unit();
          }

          return Effect.unit();
        }),
        Effect.bind("test", () =>
          RefSynchronized.modifyEffect(entities, (map) => decide(map, entityId))
        ),
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
                      Effect.zipLeft(
                        Queue.offer(queue, req),
                        Deferred.succeed(promise, Option.none())
                      ),
                    (replyId_) =>
                      Effect.zipRight(
                        sharding.initReply(replyId_, promise),
                        Queue.offer(queue, req)
                      )
                  ),
                  Effect.catchAllCause(() => send(entityId, req, replyId, promise))
                );
              }
            )
          )
        )
      );
    }

    const terminateAllEntities = Effect.flatMap(
      RefSynchronized.getAndSet(entities, HashMap.empty()),
      terminateEntities
    );

    function terminateEntities(
      entitiesToTerminate: HashMap.HashMap<
        string,
        readonly [Option.Option<Queue.Queue<Req>>, Fiber.RuntimeFiber<never, void>]
      >
    ) {
      return pipe(
        Effect.forEach(entitiesToTerminate, ([_, [queue_, __]]) => {
          return Effect.tap(Deferred.make<never, boolean>(), (p) =>
            pipe(
              queue_,
              Option.match(
                () => Deferred.succeed(p, true),
                (queue) =>
                  pipe(
                    terminateMessage(p),
                    Option.match(
                      () => Effect.zipRight(Queue.shutdown(queue), Deferred.succeed(p, true)),
                      (terminate) =>
                        Effect.catchAllCause(Queue.offer(queue, terminate), () =>
                          Deferred.succeed(p, true)
                        )
                    )
                  )
              )
            )
          );
        }),
        Effect.flatMap((promises) =>
          Effect.timeout(
            Effect.forEachDiscard(promises, Deferred.await),
            config.entityTerminationTimeout
          )
        )
      );
    }

    function terminateEntitiesOnShards(shards: HashSet.HashSet<ShardId.ShardId>) {
      return pipe(
        RefSynchronized.modify(entities, (entities) => [
          HashMap.filterWithIndex(entities, (_, entityId) =>
            HashSet.has(shards, sharding.getShardId(recipientType, entityId))
          ),
          entities,
        ]),
        Effect.flatMap(terminateEntities)
      );
    }

    const self: EntityManager<Req> = { send, terminateAllEntities, terminateEntitiesOnShards };
    return self;
  });
}
