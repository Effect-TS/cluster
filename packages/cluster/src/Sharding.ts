/**
 * @since 1.0.0
 */
import { Tag } from "effect/Context"
import type * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import type * as HashSet from "effect/HashSet"
import type * as Option from "effect/Option"
import type * as Scope from "effect/Scope"
import type * as Stream from "effect/Stream"
import type { Broadcaster } from "./Broadcaster.js"
import type { Messenger } from "./Messenger.js"
import type * as PodAddress from "./PodAddress.js"
import type * as RecipientBehaviour from "./RecipientBehaviour.js"
import type * as RecipentType from "./RecipientType.js"
import type * as SerializedEnvelope from "./SerializedEnvelope.js"
import type * as SerializedMessage from "./SerializedMessage.js"
import type * as ShardId from "./ShardId.js"
import type * as ShardingError from "./ShardingError.js"
import type * as ShardingRegistrationEvent from "./ShardingRegistrationEvent.js"

/**
 * @since 1.0.0
 * @category models
 */
export interface Sharding {
  readonly getShardId: (recipientType: RecipentType.RecipientType<any>, entityId: string) => ShardId.ShardId
  readonly register: Effect.Effect<never, never, void>
  readonly unregister: Effect.Effect<never, never, void>
  readonly messenger: <Msg>(
    entityType: RecipentType.EntityType<Msg>,
    sendTimeout?: Option.Option<Duration.Duration>
  ) => Messenger<Msg>
  readonly broadcaster: <Msg>(
    topicType: RecipentType.TopicType<Msg>,
    sendTimeout?: Option.Option<Duration.Duration>
  ) => Broadcaster<Msg>
  readonly isEntityOnLocalShards: (
    recipientType: RecipentType.RecipientType<any>,
    entityId: string
  ) => Effect.Effect<never, never, boolean>
  readonly isShuttingDown: Effect.Effect<never, never, boolean>

  readonly registerScoped: Effect.Effect<Scope.Scope, never, void>
  readonly registerEntity: <Req, R>(
    entityType: RecipentType.EntityType<Req>,
    behaviour: RecipientBehaviour.RecipientBehaviour<R, Req>,
    options?: RecipientBehaviour.EntityBehaviourOptions
  ) => Effect.Effect<Exclude<R, RecipientBehaviour.RecipientBehaviourContext>, never, void>
  readonly registerTopic: <Req, R>(
    topicType: RecipentType.TopicType<Req>,
    behaviour: RecipientBehaviour.RecipientBehaviour<R, Req>,
    options?: RecipientBehaviour.EntityBehaviourOptions
  ) => Effect.Effect<Exclude<R, RecipientBehaviour.RecipientBehaviourContext>, never, void>
  readonly getShardingRegistrationEvents: Stream.Stream<
    never,
    never,
    ShardingRegistrationEvent.ShardingRegistrationEvent
  >
  readonly registerSingleton: <R>(name: string, run: Effect.Effect<R, never, void>) => Effect.Effect<R, never, void>
  readonly refreshAssignments: Effect.Effect<Scope.Scope, never, void>
  readonly assign: (shards: HashSet.HashSet<ShardId.ShardId>) => Effect.Effect<never, never, void>
  readonly unassign: (shards: HashSet.HashSet<ShardId.ShardId>) => Effect.Effect<never, never, void>
  readonly sendToLocalEntity: (
    msg: SerializedEnvelope.SerializedEnvelope
  ) => Effect.Effect<
    never,
    ShardingError.ShardingError,
    Option.Option<SerializedMessage.SerializedMessage>
  >
  readonly getPods: Effect.Effect<never, never, HashSet.HashSet<PodAddress.PodAddress>>
}

/**
 * @since 1.0.0
 * @category context
 */
export const Sharding = Tag<Sharding>()

/**
 * Notify the shard manager that shards can now be assigned to this pod.
 * @since 1.0.0
 * @category utils
 */
export const register = Effect.flatMap(Sharding, (_) => _.register)

/**
 * Notify the shard manager that shards must be unassigned from this pod.
 * @since 1.0.0
 * @category utils
 */
export const unregister = Effect.flatMap(Sharding, (_) => _.unregister)

/**
 * Same as `register`, but will automatically call `unregister` when the `Scope` is terminated.
 * @since 1.0.0
 * @category utils
 */
export const registerScoped = pipe(register, Effect.zipRight(Effect.addFinalizer(() => unregister)))

/**
 * Start a computation that is guaranteed to run only on a single pod.
 * Each pod should call `registerSingleton` but only a single pod will actually run it at any given time.
 * @since 1.0.0
 * @category utils
 */
export function registerSingleton<R>(
  name: string,
  run: Effect.Effect<R, never, void>
): Effect.Effect<Sharding | R, never, void> {
  return Effect.flatMap(Sharding, (_) => _.registerSingleton(name, run))
}

/**
 * Register a new entity type, allowing pods to send messages to entities of this type.
 * It takes a `behavior` which is a function from an entity ID and a queue of messages to a ZIO computation that runs forever and consumes those messages.
 * You can use `ZIO.interrupt` from the behavior to stop it (it will be restarted the next time the entity receives a message).
 * If entity goes to idle timeout, it will be interrupted from outside.
 * @since 1.0.0
 * @category utils
 */
export function registerEntity<Req, R>(
  entityType: RecipentType.EntityType<Req>,
  behavior: RecipientBehaviour.RecipientBehaviour<R, Req>,
  options?: RecipientBehaviour.EntityBehaviourOptions
): Effect.Effect<Sharding | Exclude<R, RecipientBehaviour.RecipientBehaviourContext>, never, void> {
  return Effect.flatMap(Sharding, (_) => _.registerEntity(entityType, behavior, options))
}

/**
 * Register a new topic type, allowing pods to broadcast messages to subscribers.
 * It takes a `behavior` which is a function from a topic and a queue of messages to a ZIO computation that runs forever and consumes those messages.
 * You can use `ZIO.interrupt` from the behavior to stop it (it will be restarted the next time the topic receives a message).
 * If entity goes to idle timeout, it will be interrupted from outside.
 * @since 1.0.0
 * @category utils
 */
export function registerTopic<Req, R>(
  topicType: RecipentType.TopicType<Req>,
  behavior: RecipientBehaviour.RecipientBehaviour<R, Req>,
  options?: RecipientBehaviour.EntityBehaviourOptions
): Effect.Effect<Sharding | Exclude<R, RecipientBehaviour.RecipientBehaviourContext>, never, void> {
  return Effect.flatMap(Sharding, (_) => _.registerTopic(topicType, behavior, options))
}

/**
 * Get an object that allows sending messages to a given entity type.
 * You can provide a custom send timeout to override the one globally defined.
 * @since 1.0.0
 * @category utils
 */
export function messenger<Msg>(
  entityType: RecipentType.EntityType<Msg>,
  sendTimeout?: Option.Option<Duration.Duration>
): Effect.Effect<Sharding, never, Messenger<Msg>> {
  return Effect.map(Sharding, (_) => _.messenger(entityType, sendTimeout))
}

/**
 * Get an object that allows broadcasting messages to a given topic type.
 * You can provide a custom send timeout to override the one globally defined.
 * @since 1.0.0
 * @category utils
 */
export function broadcaster<Msg>(
  topicType: RecipentType.TopicType<Msg>,
  sendTimeout?: Option.Option<Duration.Duration>
): Effect.Effect<Sharding, never, Broadcaster<Msg>> {
  return Effect.map(Sharding, (_) => _.broadcaster(topicType, sendTimeout))
}

/**
 * Get the list of pods currently registered to the Shard Manager
 * @since 1.0.0
 * @category utils
 */
export const getPods: Effect.Effect<Sharding, never, HashSet.HashSet<PodAddress.PodAddress>> = Effect.flatMap(
  Sharding,
  (_) => _.getPods
)
