import { Config } from "./Config";
import { PodAddress } from "./PodAddress";
import { Pods } from "./Pods";
import { Serialization } from "./Serialization";
import * as Ref from "@effect/io/Ref";
import { Hub } from "@effect/io/Hub";
import * as Synchronized from "@effect/io/Ref/Synchronized";
import * as HashMap from "@fp-ts/data/HashMap";
import { ShardId } from "./ShardId";
import { ShardingRegistrationEvent } from "./ShardingRegistrationEvent";
import { MutableList } from "@fp-ts/data/MutableList";
import { Fiber } from "@effect/io/Fiber";
import * as Effect from "@effect/io/Effect";
import * as Option from "@fp-ts/data/Option";
import { EntityState } from "./EntityState";
import * as Deferred from "@effect/io/Deferred";
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
  Throwable,
} from "./ShardError";
import { EntityType } from "./RecipientType";
import { Duration } from "@fp-ts/data/Duration";
import { Messenger } from "./Messenger";
import { duration, random } from "@fp-ts/data";

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
  lastUnhealthyNodeReported: Ref.Ref<OffsetDateTime>,
  isShuttingDownRef: Ref.Ref<boolean>,
  shardManager: ShardManagerClient,
  pods: Pods,
  storage: Storage,
  serialization: Serialization,
  eventsHub: Hub<ShardingRegistrationEvent>
) {
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
            const send = sendToPod(entityType.name, entityId, msg, pod.value, replyId);
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
              })
            );
          })
        );
      };
    }

    return { sendDiscard, send };
  }

  /*
def messenger[Msg](entityType: EntityType[Msg], sendTimeout: Option[Duration] = None): Messenger[Msg] =
    new Messenger[Msg] {
      val timeout: Duration = sendTimeout.getOrElse(config.sendTimeout)

      def sendDiscard(entityId: String)(msg: Msg): Task[Unit] =
        sendMessage(entityId, msg, None).timeout(timeout).unit

      def send[Res](entityId: String)(msg: Replier[Res] => Msg): Task[Res] =
        Random.nextUUID.flatMap { uuid =>
          val body = msg(Replier(uuid.toString))
          sendMessage[Res](entityId, body, Some(uuid.toString)).flatMap {
            case Some(value) => ZIO.succeed(value)
            case None        => ZIO.fail(new Exception(s"Send returned nothing, entityId=$entityId, body=$body"))
          }
            .timeoutFail(SendTimeoutException(entityType, entityId, body))(timeout)
            .interruptible
        }

      private def sendMessage[Res](entityId: String, msg: Msg, replyId: Option[String]): Task[Option[Res]] = {
        val shardId                    = getShardId(entityType, entityId)
        def trySend: Task[Option[Res]] =
          for {
            shards   <- shardAssignments.get
            pod       = shards.get(shardId)
            response <- pod match {
                          case Some(pod) =>
                            val send = sendToPod(entityType.name, entityId, msg, pod, replyId)
                            send.catchSome { case _: EntityNotManagedByThisPod | _: PodUnavailable =>
                              Clock.sleep(200.millis) *> trySend
                            }
                          case None      =>
                            // no shard assignment, retry
                            Clock.sleep(100.millis) *> trySend
                        }
          } yield response

        trySend
      }
    }
  */

  return {
    register,
    unregister,
    reply,
    messenger,
  };
}

export interface Sharding {
  register: Effect.Effect<never, never, void>;
  unregister: Effect.Effect<never, never, void>;
  reply<Reply>(reply: Reply, replier: Replier<Reply>): Effect.Effect<never, never, void>;
}
export const Sharding = Tag<Sharding>();
