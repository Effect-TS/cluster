/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context"
import type * as HashSet from "@effect/data/HashSet"
import type * as Option from "@effect/data/Option"
import type * as Deferred from "@effect/io/Deferred"
import * as Effect from "@effect/io/Effect"
import type * as Queue from "@effect/io/Queue"
import type * as BinaryMessage from "@effect/shardcake/BinaryMessage"
import type * as ByteArray from "@effect/shardcake/ByteArray"
import type { Replier } from "@effect/shardcake/Replier"
import type * as ReplyId from "@effect/shardcake/ReplyId"
import type { EntityTypeNotRegistered, Throwable } from "@effect/shardcake/ShardError"
import type * as StreamReplier from "@effect/shardcake/StreamReplier"
import type * as Stream from "@effect/stream/Stream"

import type * as Duration from "@effect/data/Duration"
import type { Scope } from "@effect/io/Scope"
import type * as Schema from "@effect/schema/Schema"
import type { Broadcaster } from "@effect/shardcake/Broadcaster"
import type { Messenger } from "@effect/shardcake/Messenger"
import type * as PodAddress from "@effect/shardcake/PodAddress"
import type * as RecipentType from "@effect/shardcake/RecipientType"
import type * as ReplyChannel from "@effect/shardcake/ReplyChannel"
import type * as ShardId from "@effect/shardcake/ShardId"
import type * as ShardingRegistrationEvent from "@effect/shardcake/ShardingRegistrationEvent"

/**
 * @since 1.0.0
 * @category models
 */
export interface Sharding {
  getShardId: (recipientType: RecipentType.RecipientType<any>, entityId: string) => ShardId.ShardId
  register: Effect.Effect<never, never, void>
  unregister: Effect.Effect<never, never, void>
  reply<Reply>(reply: Reply, replier: Replier<Reply>): Effect.Effect<never, never, void>
  replyStream<Reply>(
    replies: Stream.Stream<never, never, Reply>,
    replier: StreamReplier.StreamReplier<Reply>
  ): Effect.Effect<never, never, void>
  messenger<Msg>(
    entityType: RecipentType.EntityType<Msg>,
    sendTimeout?: Option.Option<Duration.Duration>
  ): Messenger<Msg>
  broadcaster<Msg>(
    topicType: RecipentType.TopicType<Msg>,
    sendTimeout?: Option.Option<Duration.Duration>
  ): Broadcaster<Msg>
  isEntityOnLocalShards(
    recipientType: RecipentType.RecipientType<any>,
    entityId: string
  ): Effect.Effect<never, never, boolean>
  isShuttingDown: Effect.Effect<never, never, boolean>
  initReply(
    id: ReplyId.ReplyId,
    replyChannel: ReplyChannel.ReplyChannel<any>
  ): Effect.Effect<never, never, void>
  registerScoped: Effect.Effect<Scope, never, void>
  registerEntity<Req, R>(
    entityType: RecipentType.EntityType<Req>,
    behavior: (entityId: string, dequeue: Queue.Dequeue<Req>) => Effect.Effect<R, never, void>,
    terminateMessage?: (p: Deferred.Deferred<never, void>) => Option.Option<Req>,
    entityMaxIdleTime?: Option.Option<Duration.Duration>
  ): Effect.Effect<Scope | R, never, void>
  registerTopic<Req, R>(
    topicType: RecipentType.TopicType<Req>,
    behavior: (entityId: string, dequeue: Queue.Dequeue<Req>) => Effect.Effect<R, never, void>,
    terminateMessage?: (p: Deferred.Deferred<never, void>) => Option.Option<Req>
  ): Effect.Effect<Scope | R, never, void>
  getShardingRegistrationEvents: Stream.Stream<never, never, ShardingRegistrationEvent.ShardingRegistrationEvent>
  registerSingleton(name: string, run: Effect.Effect<never, never, void>): Effect.Effect<never, never, void>
  refreshAssignments: Effect.Effect<never, never, void>
  assign: (shards: HashSet.HashSet<ShardId.ShardId>) => Effect.Effect<never, never, void>
  unassign: (shards: HashSet.HashSet<ShardId.ShardId>) => Effect.Effect<never, never, void>
  sendToLocalEntity(
    msg: BinaryMessage.BinaryMessage,
    replyChannel: ReplyChannel.ReplyChannel<any>
  ): Effect.Effect<never, EntityTypeNotRegistered, Option.Option<Schema.Schema<any, any>>>
  sendToLocalEntityStreamingReply(
    msg: BinaryMessage.BinaryMessage
  ): Stream.Stream<never, Throwable, ByteArray.ByteArray>
  sendToLocalEntitySingleReply(
    msg: BinaryMessage.BinaryMessage
  ): Effect.Effect<never, Throwable, Option.Option<ByteArray.ByteArray>>
  getPods: Effect.Effect<never, never, HashSet.HashSet<PodAddress.PodAddress>>
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
export const registerScoped = Effect.ensuring(register, unregister)

/**
 * Start a computation that is guaranteed to run only on a single pod.
 * Each pod should call `registerSingleton` but only a single pod will actually run it at any given time.
 * @since 1.0.0
 * @category utils
 */
export function registerSingleton(
  name: string,
  run: Effect.Effect<never, never, void>
): Effect.Effect<Sharding, never, void> {
  return Effect.flatMap(Sharding, (_) => _.registerSingleton(name, run))
}

/**
 * Register a new entity type, allowing pods to send messages to entities of this type.
 * It takes a `behavior` which is a function from an entity ID and a queue of messages to a ZIO computation that runs forever and consumes those messages.
 * You can use `ZIO.interrupt` from the behavior to stop it (it will be restarted the next time the entity receives a message).
 * If provided, the optional `terminateMessage` will be sent to the entity before it is stopped, allowing for cleanup logic.
 * @since 1.0.0
 * @category utils
 */
export function registerEntity<Req, R>(
  entityType: RecipentType.EntityType<Req>,
  behavior: (entityId: string, dequeue: Queue.Dequeue<Req>) => Effect.Effect<R, never, void>,
  terminateMessage?: (p: Deferred.Deferred<never, void>) => Option.Option<Req>,
  entityMaxIdleTime?: Option.Option<Duration.Duration>
): Effect.Effect<Sharding | Scope | R, never, void> {
  return Effect.flatMap(Sharding, (_) => _.registerEntity(entityType, behavior, terminateMessage, entityMaxIdleTime))
}

/**
 * Register a new topic type, allowing pods to broadcast messages to subscribers.
 * It takes a `behavior` which is a function from a topic and a queue of messages to a ZIO computation that runs forever and consumes those messages.
 * You can use `ZIO.interrupt` from the behavior to stop it (it will be restarted the next time the topic receives a message).
 * If provided, the optional `terminateMessage` will be sent to the topic before it is stopped, allowing for cleanup logic.
 * @since 1.0.0
 * @category utils
 */
export function registerTopic<Req, R>(
  topicType: RecipentType.TopicType<Req>,
  behavior: (entityId: string, dequeue: Queue.Dequeue<Req>) => Effect.Effect<R, never, void>,
  terminateMessage?: (p: Deferred.Deferred<never, void>) => Option.Option<Req>
): Effect.Effect<Sharding | Scope | R, never, void> {
  return Effect.flatMap(Sharding, (_) => _.registerTopic(topicType, behavior, terminateMessage))
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
