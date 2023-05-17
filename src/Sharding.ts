import { Config } from "./Config";
import { podAddress, PodAddress } from "./PodAddress";
import { Pods } from "./Pods";
import { Serialization } from "./Serialization";
import * as Ref from "@effect/io/Ref";
import { Hub } from "@effect/io/Hub";
import * as Synchronized from "@effect/io/Ref/Synchronized";
import * as HashMap from "@effect/data/HashMap";
import * as HashSet from "@effect/data/HashSet";
import * as ShardId from "./ShardId";
import { ShardingRegistrationEvent } from "./ShardingRegistrationEvent";
import { MutableList } from "@effect/data/MutableList";
import { Fiber } from "@effect/io/Fiber";
import * as Effect from "@effect/io/Effect";
import * as Cause from "@effect/io/Cause";
import * as Option from "@effect/data/Option";
import * as EntityState from "./EntityState";
import * as Deferred from "@effect/io/Deferred";
import * as Logger from "@effect/io/Logger";
import * as Queue from "@effect/io/Queue";
import * as Stream from "@effect/stream/Stream";
import { Tag } from "@effect/data/Context";
import { ShardManagerClient } from "./ShardManagerClient";
import { pipe } from "@effect/data/Function";
import { replier, Replier } from "./Replier";
import * as EntityManager from "./EntityManager";
import * as BinaryMessage from "./BinaryMessage";

import {
  EntityTypeNotRegistered,
  isEntityNotManagedByThisPodError,
  isPodUnavailableError,
  MessageReturnedNoting,
  SendTimeoutException,
  Throwable,
} from "./ShardError";
import { EntityType, RecipentType } from "./RecipientType";
import { Messenger } from "./Messenger";
import * as Duration from "@effect/data/Duration";
import * as RecipientType from "./RecipientType";
import { equals } from "@effect/data/Equal";
import { Storage } from "./Storage";
import * as Layer from "@effect/io/Layer";
import { Scope } from "@effect/io/Scope";
import * as Schedule from "@effect/io/Schedule";
import * as Schema from "@effect/schema/Schema";

function make(
  address: PodAddress,
  config: Config,
  shardAssignments: Ref.Ref<HashMap.HashMap<ShardId.ShardId, PodAddress>>,
  entityStates: Ref.Ref<HashMap.HashMap<string, EntityState.EntityState>>,
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
  storage: Storage,
  serialization: Serialization
  //eventsHub: Hub<ShardingRegistrationEvent>
) {
  function getShardId(recipientType: RecipentType<any>, entityId: string): ShardId.ShardId {
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

  const isSingletonNode: Effect.Effect<never, never, boolean> = pipe(
    Ref.get(shardAssignments),
    Effect.map((_) =>
      pipe(
        HashMap.get(_, ShardId.shardId(1)),
        Option.match(() => false, equals(address))
      )
    )
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

  function sendToLocalEntity(msg: BinaryMessage.BinaryMessage, replySchema: Option.Option<any>) {
    return pipe(
      Ref.get(entityStates),
      Effect.flatMap((states) => {
        const a = HashMap.get(states, msg.entityType);
        if (Option.isSome(a)) {
          const state = a.value;
          return pipe(
            Effect.Do(),
            Effect.bind("p", () => Deferred.make<never, Option.Option<BinaryMessage.ByteArray>>()),
            Effect.bind("interruptor", () => Deferred.make<never, void>()),
            Effect.tap(({ p, interruptor }) =>
              state.binaryQueue.offer([msg, replySchema, p, interruptor])
            ),
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
          Effect.onError((cause) => abortReply(id, Cause.squash(cause) as any)),
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
    msgSchema: Schema.Schema<Msg>,
    pod: PodAddress,
    replyId: Option.Option<string>,
    replySchema: Option.Option<Schema.Schema<Res>>
  ) {
    // TODO: handle real world cases (only simulateRemotePods for now)
    return pipe(
      serialization.encode(msg, msgSchema),
      Effect.flatMap((bytes) =>
        sendToLocalEntity(
          BinaryMessage.apply(entityId, recipientTypeName, bytes, replyId),
          replySchema
        )
      ),
      Effect.flatMap((_) => {
        if (Option.isSome(_) && Option.isSome(replySchema))
          return pipe(
            serialization.decode<Res>(_.value, replySchema.value),
            Effect.map(Option.some)
          );
        return Effect.succeed(Option.none());
      })
    );
  }

  function messenger<Msg>(
    entityType: EntityType<Msg>,
    sendTimeout: Option.Option<Duration.Duration> = Option.none()
  ): Messenger<Msg> {
    const timeout = pipe(
      sendTimeout,
      Option.getOrElse(() => config.sendTimeout)
    );

    function sendDiscard(entityId: string) {
      return (msg: Msg) =>
        pipe(
          sendMessage(entityId, msg, Option.none(), Option.none()),
          Effect.timeout(timeout),
          Effect.asUnit
        );
    }

    function sendMessage<Res>(
      entityId: string,
      msg: Msg,
      replyId: Option.Option<string>,
      replySchema: Option.Option<Schema.Schema<Res>>
    ) {
      const shardId = getShardId(entityType, entityId);

      const trySend: Effect.Effect<never, Throwable, Option.Option<Res>> = pipe(
        Effect.Do(),
        Effect.bind("shards", () => Ref.get(shardAssignments)),
        Effect.let("pod", ({ shards }) => HashMap.get(shards, shardId)),
        Effect.bind("response", ({ pod, shards }) => {
          if (Option.isSome(pod)) {
            const send = sendToPod(
              entityType.name,
              entityId,
              msg,
              entityType.schema,
              pod.value,
              replyId,
              replySchema
            );
            return pipe(
              send,
              Effect.catchSome((_) => {
                if (isEntityNotManagedByThisPodError(_) || isPodUnavailableError(_)) {
                  return pipe(
                    Effect.sleep(Duration.millis(200)),
                    Effect.zipRight(trySend),
                    Option.some
                  );
                }
                return Option.none();
              })
            );
          }

          return pipe(Effect.sleep(Duration.millis(100)), Effect.zipRight(trySend));
        }),
        Effect.map((_) => _.response)
      );

      return trySend;
    }

    function send(entityId: string) {
      return <Res>(replySchema: Schema.Schema<Res>, msg: (replier: Replier<Res>) => Msg) => {
        return pipe(
          Effect.sync(() => "r" + Math.random()),
          Effect.flatMap((uuid) => {
            const body = msg(replier(uuid, replySchema));
            return pipe(
              sendMessage(entityId, body, Option.some(uuid), Option.some(replySchema)),
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
    terminateMessage: (p: Deferred.Deferred<never, void>) => Option.Option<Req> = () =>
      Option.none(),
    entityMaxIdleTime: Option.Option<Duration.Duration> = Option.none()
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
              BinaryMessage.BinaryMessage,
              Option.Option<Schema.Schema<any>>,
              Deferred.Deferred<Throwable, Option.Option<BinaryMessage.ByteArray>>,
              Deferred.Deferred<never, void>
            ]
          >()
        )
      );

      yield* $(
        pipe(
          entityStates,
          Ref.update(HashMap.set(recipientType.name, EntityState.apply(binaryQueue, entityManager)))
        )
      );

      yield* $(Effect.log("Starting drainer for " + recipientType.name));

      yield* $(
        pipe(
          Stream.fromQueue(binaryQueue),
          Stream.mapEffect(([msg, replySchema, p, interruptor]) =>
            pipe(
              Effect.Do(),
              Effect.bind("req", () => serialization.decode<Req>(msg.body, recipientType.schema)),
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
                    () => Effect.succeed(Option.none()),
                    (_) =>
                      pipe(
                        serialization.encode(_, Option.getOrUndefined(replySchema)!),
                        Effect.map(Option.some)
                      )
                  )
                )
              ),
              Effect.tap((_) => pipe(p, Deferred.succeed(_.res))),
              Effect.catchAllCause((cause) => pipe(p, Deferred.fail(Cause.squash(cause)))),
              Effect.raceFirst(Deferred.await(interruptor)),
              Effect.fork,
              Effect.asUnit
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
    terminateMessage: (p: Deferred.Deferred<never, void>) => Option.Option<Req> = () =>
      Option.none(),
    entityMaxIdleTime: Option.Option<Duration.Duration> = Option.none()
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
      Effect.let("shardId", () => getShardId(recipientType, entityId)),
      Effect.let("pod", ({ shards, shardId }) => pipe(shards, HashMap.get(shardId))),
      Effect.map((_) => Option.isSome(_.pod) && equals(_.pod.value, address))
    );
  }

  const refreshAssignments: Effect.Effect<never, never, void> = pipe(
    Stream.fromEffect(Effect.map(shardManager.getAssignments, (_) => [_, true] as const)),
    Stream.merge(
      pipe(
        storage.assignmentsStream,
        Stream.map((_) => [_, false] as const)
      )
    ),
    Stream.mapEffect(([assignmentsOpt, fromShardManager]) =>
      updateAssignments(assignmentsOpt, fromShardManager)
    ),
    Stream.runDrain,
    Effect.retry(Schedule.fixed(config.refreshAssignmentsRetryInterval)),
    Effect.interruptible,
    Effect.forkDaemon,
    // TODO: missing withFinalizer (fiber interrupt)
    Effect.asUnit
  );

  function updateAssignments(
    assignmentsOpt: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress>>,
    fromShardManager: boolean
  ) {
    const assignments = HashMap.mapWithIndex(assignmentsOpt, (v, k) =>
      Option.getOrElse(v, () => address)
    );

    if (fromShardManager)
      return Ref.update(shardAssignments, (map) => (HashMap.isEmpty(map) ? assignments : map));

    return Effect.unit();
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

  const startSingletonsIfNeeded = Effect.unit();

  function assign(shards: HashSet.HashSet<ShardId.ShardId>) {
    return pipe(
      Ref.update(shardAssignments, (_) =>
        HashSet.reduce(shards, _, (_, shardId) => HashMap.set(_, shardId, address))
      ),
      Effect.zipRight(startSingletonsIfNeeded),
      Effect.zipLeft(Effect.logDebug("Assigned shards: " + JSON.stringify(shards))),
      Effect.unlessEffect(isShuttingDown),
      Effect.asUnit
    );
  }

  function unassign(shards: HashSet.HashSet<ShardId.ShardId>) {
    return pipe(
      Ref.update(shardAssignments, (_) =>
        HashSet.reduce(shards, _, (_, shardId) => {
          const value = HashMap.get(_, shardId);
          if (Option.isSome(value) && equals(value.value, address)) {
            return HashMap.remove(_, shardId);
          }
          return _;
        })
      ),
      Effect.zipRight(Effect.logDebug("Unassigning shards: " + JSON.stringify(shards)))
    );
  }

  /**
   *   private[shardcake] def assign(shards: Set[ShardId]): UIO[Unit] =
  private[shardcake] def unassign(shards: Set[ShardId]): UIO[Unit] =
    shardAssignments.update(shards.foldLeft(_) { case (map, shard) =>
      if (map.get(shard).contains(address)) map - shard else map
    }) *>
      ZIO.logDebug(s"Unassigning shards: $shards") *>
      entityStates.get.flatMap(state =>
        ZIO.foreachDiscard(state.values)(
          _.entityManager.terminateEntitiesOnShards(shards) // this will return once all shards are terminated
        )
      ) *>
      stopSingletonsIfNeeded <*
      ZIO.logDebug(s"Unassigned shards: $shards")
   */

  const self: Sharding = {
    getShardId,
    register,
    unregister,
    reply,
    messenger,
    isEntityOnLocalShards,
    isShuttingDown,
    initReply,
    registerScoped,
    registerEntity,
    refreshAssignments,
    assign,
    unassign,
    sendToLocalEntity,
  };

  return self;
}

export interface Sharding {
  getShardId: (recipientType: RecipentType<any>, entityId: string) => ShardId.ShardId;
  register: Effect.Effect<never, never, void>;
  unregister: Effect.Effect<never, never, void>;
  reply<Reply>(reply: Reply, replier: Replier<Reply>): Effect.Effect<never, never, void>;
  messenger<Msg>(
    entityType: EntityType<Msg>,
    sendTimeout?: Option.Option<Duration.Duration>
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
    entityMaxIdleTime?: Option.Option<Duration.Duration>
  ): Effect.Effect<Scope | R, never, void>;
  refreshAssignments: Effect.Effect<never, never, void>;
  assign: (shards: HashSet.HashSet<ShardId.ShardId>) => Effect.Effect<never, never, void>;
  unassign: (shards: HashSet.HashSet<ShardId.ShardId>) => Effect.Effect<never, never, void>;
  sendToLocalEntity(
    msg: BinaryMessage.BinaryMessage,
    replySchema: Option.Option<any>
  ): Effect.Effect<never, EntityTypeNotRegistered, Option.Option<unknown>>;
}

export const Sharding = Tag<Sharding>();

export const live = Layer.scoped(
  Sharding,
  pipe(
    Effect.Do(),
    Effect.bind("config", () => Config),
    Effect.bind("pods", () => Pods),
    Effect.bind("shardManager", () => ShardManagerClient),
    Effect.bind("storage", () => Storage),
    Effect.bind("serialization", () => Serialization),
    Effect.bind("shardsCache", () => Ref.make(HashMap.empty<ShardId.ShardId, PodAddress>())),
    Effect.bind("entityStates", () => Ref.make(HashMap.empty<string, EntityState.EntityState>())),
    Effect.bind("shuttingDown", () => Ref.make(false)),
    Effect.bind("promises", () =>
      Synchronized.make(HashMap.empty<string, Deferred.Deferred<Throwable, Option.Option<any>>>())
    ),
    Effect.let("sharding", (_) =>
      make(
        podAddress(_.config.selfHost, _.config.shardingPort),
        _.config,
        _.shardsCache,
        _.entityStates,
        _.promises,
        _.shuttingDown,
        _.shardManager,
        _.storage,
        _.serialization
      )
    ),
    Effect.tap((_) => _.sharding.refreshAssignments),
    Effect.map((_) => _.sharding)
  )
);
