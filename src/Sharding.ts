import { Config } from "./Config";
import { PodAddress } from "./PodAddress";
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
import * as Option from "@fp-ts/data/Option";
import { EntityState } from "./EntityState";
import * as Deferred from "@effect/io/Deferred";
import * as Queue from "@effect/io/Queue";
import { Tag } from "@fp-ts/data/Context";
import { ShardManagerClient } from "./ShardManagerClient";
import { pipe } from "@fp-ts/data/Function";
import { replier, Replier } from "./Replier";
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

function make(
  address: PodAddress,
  config: Config,
  shardAssignments: Ref.Ref<HashMap.HashMap<ShardId, PodAddress>>,
  entityStates: Ref.Ref<HashMap.HashMap<string, EntityState>>,
  singletons: Synchronized.Synchronized<
    MutableList<[string, Effect.Effect<never, never, void>, Option.Option<Fiber<never, never>>]>
  >,
  replyPromises: Synchronized.Synchronized<
    HashMap.HashMap<string, Deferred.Deferred<Error, Option.Option<any>>>
  >, // promise for each pending reply,
  lastUnhealthyNodeReported: Ref.Ref<Date>,
  isShuttingDownRef: Ref.Ref<boolean>,
  shardManager: ShardManagerClient,
  pods: Pods,
  storage: Storage,
  serialization: Serialization,
  eventsHub: Hub<ShardingRegistrationEvent>
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

  /*
  private[shardcake] def sendToLocalEntity(msg: BinaryMessage): Task[Option[Array[Byte]]] =
    entityStates.get.flatMap(states =>
      states.get(msg.entityType) match {
        case Some(state) =>
          for {
            p           <- Promise.make[Throwable, Option[Array[Byte]]]
            interruptor <- Promise.make[Nothing, Unit]
            _           <- state.binaryQueue.offer((msg, p, interruptor))
            result      <- p.await.onError(_ => interruptor.interrupt)
          } yield result

        case None => ZIO.fail(new Exception(s"Entity type ${msg.entityType} was not registered."))
      }
    )
  */

  function sendToLocalEntity(msg: BinaryMessage) {
    return pipe(
      Ref.get(entityStates),
      Effect.flatMap((states) => {
        const a = pipe(states, HashMap.get(msg.entityType));
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
        Effect.bind("pod", ({ shards }) => pipe(shards, HashMap.get(shardId), Effect.succeed)),
        Effect.bind("response", ({ pod }) => {
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
    return Effect.gen(function* ($) {});
  }

  /*
  def registerRecipient[R, Req: Tag](
    recipientType: RecipientType[Req],
    behavior: (String, Dequeue[Req]) => RIO[R, Nothing],
    terminateMessage: Promise[Nothing, Unit] => Option[Req] = (_: Promise[Nothing, Unit]) => None,
    entityMaxIdleTime: Option[Duration] = None
  ): URIO[Scope with R, Unit] =
    for {
      entityManager <- EntityManager.make(recipientType, behavior, terminateMessage, self, config, entityMaxIdleTime)
      binaryQueue   <- Queue
                         .unbounded[(BinaryMessage, Promise[Throwable, Option[Array[Byte]]], Promise[Nothing, Unit])]
                         .withFinalizer(_.shutdown)
      _             <- entityStates.update(_.updated(recipientType.name, EntityState(binaryQueue, entityManager)))
      _             <- ZStream
                         .fromQueue(binaryQueue)
                         .mapZIO { case (msg, p, interruptor) =>
                           ((for {
                             req       <- serialization.decode[Req](msg.body)
                             p2        <- Promise.make[Throwable, Option[Any]]
                             resOption <- (entityManager.send(msg.entityId, req, msg.replyId, p2) *> p2.await)
                                            .onError(_ => p2.interrupt)
                             res       <- ZIO.foreach(resOption)(serialization.encode)
                             _         <- p.succeed(res)
                           } yield ())
                             .catchAllCause((cause: Cause[Throwable]) => p.fail(cause.squash)) raceFirst
                             interruptor.await).fork.unit
                         }
                         .runDrain
                         .forkScoped
    } yield ()
  */

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

  const isShuttingDown = Ref.get(isShuttingDownRef);

  return {
    register,
    unregister,
    reply,
    messenger,
    isEntityOnLocalShards,
    isShuttingDown,
  } as Sharding;
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
}
export const Sharding = Tag<Sharding>();
