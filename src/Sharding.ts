import { Config } from "./Config";
import { podAddress, PodAddress } from "./PodAddress";
import { Pods } from "./Pods";
import { Serialization } from "./Serialization";
import * as Ref from "@effect/io/Ref";
import { Hub } from "@effect/io/Hub";
import * as Synchronized from "@effect/io/Ref/Synchronized";
import * as HashMap from "@fp-ts/data/HashMap";
import { shardId, ShardId } from "./ShardId";
import { ShardingRegistrationEvent } from "./ShardingRegistrationEvent";
import { MutableList } from "@fp-ts/data/MutableList";
import { Fiber } from "@effect/io/Fiber";
import * as Effect from "@effect/io/Effect";
import * as Cause from "@effect/io/Cause";
import * as Option from "@fp-ts/data/Option";
import { EntityState } from "./EntityState";
import * as Deferred from "@effect/io/Deferred";
import * as Logger from "@effect/io/Logger";
import * as Queue from "@effect/io/Queue";
import * as Stream from "@effect/stream/Stream";
import { Tag } from "@fp-ts/data/Context";
import { ShardManagerClient } from "./ShardManagerClient";
import { pipe } from "@fp-ts/data/Function";
import { replier, Replier } from "./Replier";
import * as EntityManager from "./EntityManager";
import { BinaryMessage, binaryMessage, ByteArray } from "./BinaryMessage";
import {
  EntityTypeNotRegistered,
  isEntityNotManagedByThisPodError,
  isPodUnavailableError,
  MessageReturnedNoting,
  SendTimeoutException,
  Throwable,
} from "./ShardError";
import { EntityType, RecipentType } from "./RecipientType";
import { Duration } from "@fp-ts/data/Duration";
import { Messenger } from "./Messenger";
import { duration, random } from "@fp-ts/data";
import * as RecipientType from "./RecipientType";
import { equals } from "@fp-ts/data/Equal";
import { Storage } from "./Storage";
import * as Layer from "@effect/io/Layer";
import { Scope } from "@effect/io/Scope";

function make(
  address: PodAddress,
  config: Config,
  shardAssignments: Ref.Ref<HashMap.HashMap<ShardId, PodAddress>>,
  entityStates: Ref.Ref<HashMap.HashMap<string, EntityState>>,
  /*singletons: Synchronized.Synchronized<
    MutableList<[string, Effect.Effect<never, never, void>, Option.Option<Fiber<never, never>>]>
  >,*/
  replyPromises: Synchronized.Synchronized<
    HashMap.HashMap<string, Deferred.Deferred<Throwable, Option.Option<any>>>
  >, // promise for each pending reply,
  //lastUnhealthyNodeReported: Ref.Ref<Date>,
  isShuttingDownRef: Ref.Ref<boolean>,
  shardManager: ShardManagerClient,
  //pods: Pods,
  //storage: Storage,
  serialization: Serialization
  //eventsHub: Hub<ShardingRegistrationEvent>
) {
  function getShardId(recipientType: RecipentType<any>, entityId: string): ShardId {
    return RecipientType.getShardId(entityId, config.numberOfShards);
  }

  const register = pipe(
    Effect.logDebug(`Registering pod ${address} to Shard Manager`),
    Effect.zipRight(pipe(isShuttingDownRef, Ref.set(false))),
    Effect.zipRight(shardManager.register(address))
  );

  const unregister: Effect.Effect<never, never, void> = pipe(
    shardManager.getAssignments,
    Effect.zipRight(Effect.logDebug(`Stopping local entities`)),
    Effect.zipRight(pipe(isShuttingDownRef, Ref.set(true))),
    Effect.zipRight(
      pipe(
        Ref.get(entityStates),
        Effect.flatMap(
          Effect.forEachDiscard(
            ([shardId, entityState]) => entityState.entityManager.terminateAllEntities
          )
        )
      )
    ),
    Effect.zipRight(Effect.logDebug(`Unregistering pod ${address} to Shard Manager`)),
    Effect.zipRight(shardManager.unregister(address))
  );

  const registerScoped: Effect.Effect<Scope, never, void> = Effect.acquireRelease(
    register,
    (_) => unregister
  );

  function reply<Reply>(reply: Reply, replier: Replier<Reply>): Effect.Effect<never, never, void> {
    return pipe(
      replyPromises,
      Synchronized.updateEffect((promises) =>
        pipe(
          Effect.whenCase(
            () => pipe(promises, HashMap.get(replier.id)),
            Option.map((deferred) => pipe(deferred, Deferred.succeed(Option.some(reply))))
          ),
          Effect.as(pipe(promises, HashMap.remove(replier.id)))
        )
      )
    );
  }

  function sendToLocalEntity(msg: BinaryMessage) {
    return pipe(
      Ref.get(entityStates),
      Effect.flatMap((states) => {
        const a = pipe(states, HashMap.get(msg.entityType));
        console.log("dealing with message", msg.body);
        if (Option.isSome(a)) {
          const state = a.value;
          return pipe(
            Effect.Do(),
            Effect.bind("p", () => Deferred.make<never, Option.Option<ByteArray>>()),
            Effect.bind("interruptor", () => Deferred.make<never, void>()),
            Effect.tap(({ p, interruptor }) => state.binaryQueue.offer([msg, p, interruptor])),
            Effect.flatMap(({ p, interruptor }) =>
              pipe(
                Deferred.await(p),
                Effect.onError((_) => Deferred.interrupt(interruptor))
              )
            )
          );
        } else {
          return Effect.fail(EntityTypeNotRegistered(msg.entityType));
        }
      })
    );
  }

  function initReply(
    id: string,
    promise: Deferred.Deferred<Throwable, Option.Option<any>>
  ): Effect.Effect<never, never, void> {
    return pipe(
      replyPromises,
      Synchronized.update(HashMap.set(id, promise)),
      Effect.zipLeft(
        pipe(
          promise,
          Deferred.await,
          Effect.onError((cause) => abortReply(id, pipe(cause, Cause.squash) as any)),
          Effect.forkDaemon
        )
      )
    );
  }

  function abortReply(id: string, ex: Throwable) {
    return pipe(
      replyPromises,
      Synchronized.updateEffect((promises) =>
        pipe(
          Effect.whenCase(() => pipe(promises, HashMap.get(id)), Option.map(Deferred.fail(ex))),
          Effect.as(pipe(promises, HashMap.remove(id)))
        )
      )
    );
  }

  function sendToPod<Msg, Res>(
    recipientTypeName: string,
    entityId: string,
    msg: Msg,
    pod: PodAddress,
    replyId: Option.Option<string>
  ) {
    // TODO: handle real world cases (only simulateRemotePods for now)
    return pipe(
      serialization.encode(msg),
      Effect.flatMap((bytes) =>
        sendToLocalEntity(binaryMessage(entityId, recipientTypeName, bytes, replyId))
      ),
      Effect.flatMap((_) => {
        if (Option.isSome(_))
          return pipe(serialization.decode<Res>(_.value), Effect.map(Option.some));
        return Effect.succeed(Option.none);
      })
    );
  }

  function messenger<Msg>(
    entityType: EntityType<Msg>,
    sendTimeout: Option.Option<Duration> = Option.none
  ): Messenger<Msg> {
    const timeout = pipe(
      sendTimeout,
      Option.getOrElse(() => config.sendTimeout)
    );

    function sendDiscard(entityId: string) {
      return (msg: Msg) =>
        pipe(sendMessage(entityId, msg, Option.none), Effect.timeout(timeout), Effect.asUnit);
    }

    function sendMessage<Res>(entityId: string, msg: Msg, replyId: Option.Option<string>) {
      const shardId = getShardId(entityType, entityId);

      const trySend: Effect.Effect<never, Throwable, Option.Option<Res>> = pipe(
        Effect.Do(),
        Effect.bind("shards", () => Ref.get(shardAssignments)),
        Effect.bindValue("pod", ({ shards }) => pipe(shards, HashMap.get(shardId))),
        Effect.bind("response", ({ pod }) => {
          console.log("sending", msg, pod);
          if (Option.isSome(pod)) {
            const send = sendToPod<Msg, Res>(entityType.name, entityId, msg, pod.value, replyId);
            return pipe(
              send,
              Effect.catchSome((_) => {
                if (isEntityNotManagedByThisPodError(_) || isPodUnavailableError(_)) {
                  return pipe(
                    Effect.sleep(duration.millis(200)),
                    Effect.zipRight(trySend),
                    Option.some
                  );
                }
                return Option.none;
              })
            );
          }

          return pipe(Effect.sleep(duration.millis(100)), Effect.zipRight(trySend));
        }),
        Effect.map((_) => _.response)
      );

      return trySend;
    }

    function send<Res>(entityId: string) {
      return (msg: (replier: Replier<Res>) => Msg) => {
        return pipe(
          Effect.sync(() => "r" + Math.random()),
          Effect.flatMap((uuid) => {
            const body = msg(replier(uuid));
            return pipe(
              sendMessage<Res>(entityId, body, Option.some(uuid)),
              Effect.flatMap((_) => {
                if (Option.isSome(_)) return Effect.succeed(_.value);
                return Effect.fail(MessageReturnedNoting(entityId, body));
              }),
              Effect.timeoutFail(() => SendTimeoutException(entityType, entityId, body), timeout),
              Effect.interruptible
            );
          })
        );
      };
    }

    return { sendDiscard, send };
  }

  function registerRecipient<R, Req>(
    recipientType: RecipentType<Req>,
    behavior: (entityId: string, dequeue: Queue.Dequeue<Req>) => Effect.Effect<R, never, void>,
    terminateMessage: (p: Deferred.Deferred<never, void>) => Option.Option<Req> = () => Option.none,
    entityMaxIdleTime: Option.Option<Duration> = Option.none
  ) {
    return Effect.gen(function* ($) {
      const entityManager = yield* $(
        EntityManager.make(
          recipientType,
          behavior,
          terminateMessage,
          self,
          config,
          entityMaxIdleTime
        )
      );

      const binaryQueue = yield* $(
        pipe(
          Queue.unbounded<
            readonly [
              BinaryMessage,
              Deferred.Deferred<Throwable, Option.Option<ByteArray>>,
              Deferred.Deferred<never, void>
            ]
          >()
        )
      );

      yield* $(
        pipe(
          entityStates,
          Ref.update(HashMap.set(recipientType.name, EntityState({ binaryQueue, entityManager })))
        )
      );

      yield* $(
        pipe(
          Stream.fromQueue(binaryQueue),
          Stream.mapEffect(([msg, p, interruptor]) =>
            pipe(
              Effect.Do(),
              Effect.tap((_) => Effect.logDebug("got something ")),
              Effect.bind("req", () => serialization.decode<Req>(msg.body)),
              Effect.tap((_) => Effect.logDebug("got request " + JSON.stringify(_.req))),
              Effect.bind("p2", () => Deferred.make<Throwable, Option.Option<any>>()),
              Effect.bind("resOption", (_) =>
                pipe(
                  entityManager.send(msg.entityId, _.req, msg.replyId, _.p2),
                  Effect.zipRight(Deferred.await(_.p2)),
                  Effect.onError((__) => Deferred.interrupt(_.p2))
                )
              ),
              Effect.bind("res", (_) =>
                pipe(
                  _.resOption,
                  Option.match(
                    () => Effect.succeed(Option.none),
                    (_) => pipe(serialization.encode(_), Effect.map(Option.some))
                  )
                )
              ),
              Effect.tap((_) => pipe(p, Deferred.succeed(_.res))),
              Effect.catchAllCause((cause) => pipe(p, Deferred.fail(Cause.squash(cause)))),
              Effect.raceFirst(Deferred.await(interruptor)),
              Effect.fork,
              Effect.unit
            )
          ),
          Stream.runDrain,
          Effect.forkScoped
        )
      );
    });
  }

  function registerEntity<R, Req>(
    entityType: EntityType<Req>,
    behavior: (entityId: string, dequeue: Queue.Dequeue<Req>) => Effect.Effect<R, never, void>,
    terminateMessage: (p: Deferred.Deferred<never, void>) => Option.Option<Req> = () => Option.none,
    entityMaxIdleTime: Option.Option<Duration> = Option.none
  ): Effect.Effect<Scope | R, never, void> {
    return registerRecipient(entityType, behavior, terminateMessage, entityMaxIdleTime);
  }

  function isEntityOnLocalShards(
    recipientType: RecipentType<any>,
    entityId: string
  ): Effect.Effect<never, never, boolean> {
    return pipe(
      Effect.Do(),
      Effect.bind("shards", () => Ref.get(shardAssignments)),
      Effect.bindValue("shardId", () => getShardId(recipientType, entityId)),
      Effect.bindValue("pod", ({ shards, shardId }) => pipe(shards, HashMap.get(shardId))),
      Effect.map((_) => Option.isSome(_.pod) && equals(_.pod.value, address))
    );
  }

  function updateAssignments(
    assignmentsOpt: HashMap.HashMap<ShardId, Option.Option<PodAddress>>,
    fromShardManager: boolean
  ) {
    const assignments = pipe(assignmentsOpt);

    pipe(
      shardAssignments,
      Ref.update((map) => (HashMap.isEmpty(map) ? assignments : map))
    );
  }

  /*
    private def updateAssignments(
    assignmentsOpt: Map[ShardId, Option[PodAddress]],
    fromShardManager: Boolean
  ): UIO[Unit] = {
    val assignments = assignmentsOpt.flatMap { case (k, v) => v.map(k -> _) }
    ZIO.logDebug("Received new shard assignments") *>
      (if (fromShardManager) shardAssignments.update(map => if (map.isEmpty) assignments else map)
       else
         shardAssignments.update(map =>
           // we keep self assignments (we don't override them with the new assignments
           // because only the Shard Manager is able to change assignments of the current node, via assign/unassign
           assignments.filter { case (_, pod) => pod != address } ++
             map.filter { case (_, pod) => pod == address }
         ))
  }
  */

  const isShuttingDown = Ref.get(isShuttingDownRef);

  const self: Sharding = {
    register,
    unregister,
    reply,
    messenger,
    isEntityOnLocalShards,
    isShuttingDown,
    initReply,
    registerScoped,
    registerEntity,
  };

  return self;
}

export interface Sharding {
  register: Effect.Effect<never, never, void>;
  unregister: Effect.Effect<never, never, void>;
  reply<Reply>(reply: Reply, replier: Replier<Reply>): Effect.Effect<never, never, void>;
  messenger<Msg>(
    entityType: EntityType<Msg>,
    sendTimeout?: Option.Option<Duration>
  ): Messenger<Msg>;
  isEntityOnLocalShards(
    recipientType: RecipentType<any>,
    entityId: string
  ): Effect.Effect<never, never, boolean>;
  isShuttingDown: Effect.Effect<never, never, boolean>;
  initReply(
    id: string,
    promise: Deferred.Deferred<Throwable, Option.Option<any>>
  ): Effect.Effect<never, never, void>;
  registerScoped: Effect.Effect<Scope, never, void>;
  registerEntity<R, Req>(
    entityType: EntityType<Req>,
    behavior: (entityId: string, dequeue: Queue.Dequeue<Req>) => Effect.Effect<R, never, void>,
    terminateMessage?: (p: Deferred.Deferred<never, void>) => Option.Option<Req>,
    entityMaxIdleTime?: Option.Option<Duration>
  ): Effect.Effect<Scope | R, never, void>;
}
export const Sharding = Tag<Sharding>();

export const live = pipe(
  Effect.Do(),
  Effect.bind("config", () => Effect.service(Config)),
  Effect.bind("pods", () => Effect.service(Pods)),
  Effect.bind("shardManager", () => Effect.service(ShardManagerClient)),
  Effect.bind("storage", () => Effect.service(Storage)),
  Effect.bind("serialization", () => Effect.service(Serialization)),
  Effect.bind("shardsCache", () => Ref.make(HashMap.empty<ShardId, PodAddress>())),
  Effect.bind("entityStates", () => Ref.make(HashMap.empty<string, EntityState>())),
  Effect.bind("shuttingDown", () => Ref.make(false)),
  Effect.bind("promises", () =>
    Synchronized.make(HashMap.empty<string, Deferred.Deferred<Throwable, Option.Option<any>>>())
  ),
  Effect.bindValue("sharding", (_) =>
    make(
      podAddress(_.config.selfHost, _.config.shardingPort),
      _.config,
      _.shardsCache,
      _.entityStates,
      _.promises,
      _.shuttingDown,
      _.shardManager,
      _.serialization
    )
  ),
  Effect.map((_) => _.sharding),
  Layer.scoped(Sharding)
);

/**
  val live: ZLayer[Pods with ShardManagerClient with Storage with Serialization with Config, Throwable, Sharding] =
    ZLayer.scoped {
      for {
        config                    <- ZIO.service[Config]
        pods                      <- ZIO.service[Pods]
        shardManager              <- ZIO.service[ShardManagerClient]
        storage                   <- ZIO.service[Storage]
        serialization             <- ZIO.service[Serialization]
        shardsCache               <- Ref.make(Map.empty[ShardId, PodAddress])
        entityStates              <- Ref.make[Map[String, EntityState]](Map())
        singletons                <- Ref.Synchronized
                                       .make[List[(String, UIO[Nothing], Option[Fiber[Nothing, Nothing]])]](Nil)
                                       .withFinalizer(
                                         _.get.flatMap(singletons =>
                                           ZIO.foreach(singletons) {
                                             case (_, _, Some(fiber)) => fiber.interrupt
                                             case _                   => ZIO.unit
                                           }
                                         )
                                       )
        promises                  <- Ref.Synchronized.make[Map[String, Promise[Throwable, Option[Any]]]](Map())
        cdt                       <- Clock.currentDateTime
        lastUnhealthyNodeReported <- Ref.make(cdt)
        shuttingDown              <- Ref.make(false)
        eventsHub                 <- Hub.unbounded[ShardingRegistrationEvent]
        sharding                   = new Sharding(
                                       PodAddress(config.selfHost, config.shardingPort),
                                       config,
                                       shardsCache,
                                       entityStates,
                                       singletons,
                                       promises,
                                       lastUnhealthyNodeReported,
                                       shuttingDown,
                                       shardManager,
                                       pods,
                                       storage,
                                       serialization,
                                       eventsHub
                                     )
        _                         <- sharding.getShardingRegistrationEvents.mapZIO(event => ZIO.logInfo(event.toString)).runDrain.forkDaemon
        _                         <- sharding.refreshAssignments
      } yield sharding
    }
 */
