/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context";
import type * as Duration from "@effect/data/Duration";
import type * as HashSet from "@effect/data/HashSet";
import type * as Option from "@effect/data/Option";
import * as Effect from "@effect/io/Effect";
import type * as Scope from "@effect/io/Scope";
import type * as BinaryMessage from "@effect/shardcake/BinaryMessage";
import type { Broadcaster } from "@effect/shardcake/Broadcaster";
import type * as ByteArray from "@effect/shardcake/ByteArray";
import type { Messenger } from "@effect/shardcake/Messenger";
import type * as PodAddress from "@effect/shardcake/PodAddress";
import type * as RecipientBehaviour from "@effect/shardcake/RecipientBehaviour";
import type * as RecipentType from "@effect/shardcake/RecipientType";
import type { Replier } from "@effect/shardcake/Replier";
import type * as ReplyChannel from "@effect/shardcake/ReplyChannel";
import type * as ReplyId from "@effect/shardcake/ReplyId";
import type { Throwable } from "@effect/shardcake/ShardError";
import type * as ShardId from "@effect/shardcake/ShardId";
import type * as ShardingRegistrationEvent from "@effect/shardcake/ShardingRegistrationEvent";
import type * as StreamReplier from "@effect/shardcake/StreamReplier";
import type * as Stream from "@effect/stream/Stream";
/**
 * @since 1.0.0
 * @category models
 */
export interface Sharding {
    readonly getShardId: (recipientType: RecipentType.RecipientType<any>, entityId: string) => ShardId.ShardId;
    readonly register: Effect.Effect<never, never, void>;
    readonly unregister: Effect.Effect<never, never, void>;
    readonly reply: <Reply>(reply: Reply, replier: Replier<Reply>) => Effect.Effect<never, never, void>;
    readonly replyStream: <Reply>(replies: Stream.Stream<never, never, Reply>, replier: StreamReplier.StreamReplier<Reply>) => Effect.Effect<never, never, void>;
    readonly messenger: <Msg>(entityType: RecipentType.EntityType<Msg>, sendTimeout?: Option.Option<Duration.Duration>) => Messenger<Msg>;
    readonly broadcaster: <Msg>(topicType: RecipentType.TopicType<Msg>, sendTimeout?: Option.Option<Duration.Duration>) => Broadcaster<Msg>;
    readonly isEntityOnLocalShards: (recipientType: RecipentType.RecipientType<any>, entityId: string) => Effect.Effect<never, never, boolean>;
    readonly isShuttingDown: Effect.Effect<never, never, boolean>;
    readonly initReply: (id: ReplyId.ReplyId, replyChannel: ReplyChannel.ReplyChannel<any>) => Effect.Effect<never, never, void>;
    readonly registerScoped: Effect.Effect<Scope.Scope, never, void>;
    readonly registerEntity: <Req, R>(entityType: RecipentType.EntityType<Req>, behaviour: RecipientBehaviour.RecipientBehaviour<R, Req>, options?: RecipientBehaviour.EntityBehaviourOptions<R, Req>) => Effect.Effect<R, never, void>;
    readonly registerTopic: <Req, R>(topicType: RecipentType.TopicType<Req>, behaviour: RecipientBehaviour.RecipientBehaviour<R, Req>, options?: RecipientBehaviour.EntityBehaviourOptions<R, Req>) => Effect.Effect<R, never, void>;
    readonly getShardingRegistrationEvents: Stream.Stream<never, never, ShardingRegistrationEvent.ShardingRegistrationEvent>;
    readonly registerSingleton: <R>(name: string, run: Effect.Effect<R, never, void>) => Effect.Effect<R, never, void>;
    readonly refreshAssignments: Effect.Effect<Scope.Scope, never, void>;
    readonly assign: (shards: HashSet.HashSet<ShardId.ShardId>) => Effect.Effect<never, never, void>;
    readonly unassign: (shards: HashSet.HashSet<ShardId.ShardId>) => Effect.Effect<never, never, void>;
    readonly sendToLocalEntityStreamingReply: (msg: BinaryMessage.BinaryMessage) => Stream.Stream<never, Throwable, ByteArray.ByteArray>;
    readonly sendToLocalEntitySingleReply: (msg: BinaryMessage.BinaryMessage) => Effect.Effect<never, Throwable, Option.Option<ByteArray.ByteArray>>;
    readonly getPods: Effect.Effect<never, never, HashSet.HashSet<PodAddress.PodAddress>>;
}
/**
 * @since 1.0.0
 * @category context
 */
export declare const Sharding: Tag<Sharding, Sharding>;
/**
 * Notify the shard manager that shards can now be assigned to this pod.
 * @since 1.0.0
 * @category utils
 */
export declare const register: Effect.Effect<Sharding, never, void>;
/**
 * Notify the shard manager that shards must be unassigned from this pod.
 * @since 1.0.0
 * @category utils
 */
export declare const unregister: Effect.Effect<Sharding, never, void>;
/**
 * Same as `register`, but will automatically call `unregister` when the `Scope` is terminated.
 * @since 1.0.0
 * @category utils
 */
export declare const registerScoped: Effect.Effect<Sharding | Scope.Scope, never, void>;
/**
 * Start a computation that is guaranteed to run only on a single pod.
 * Each pod should call `registerSingleton` but only a single pod will actually run it at any given time.
 * @since 1.0.0
 * @category utils
 */
export declare function registerSingleton<R>(name: string, run: Effect.Effect<R, never, void>): Effect.Effect<Sharding | R, never, void>;
/**
 * Register a new entity type, allowing pods to send messages to entities of this type.
 * It takes a `behavior` which is a function from an entity ID and a queue of messages to a ZIO computation that runs forever and consumes those messages.
 * You can use `ZIO.interrupt` from the behavior to stop it (it will be restarted the next time the entity receives a message).
 * If entity goes to idle timeout, it will be interrupted from outside.
 * @since 1.0.0
 * @category utils
 */
export declare function registerEntity<Req, R>(entityType: RecipentType.EntityType<Req>, behavior: RecipientBehaviour.RecipientBehaviour<R, Req>, options?: RecipientBehaviour.EntityBehaviourOptions<R, Req>): Effect.Effect<Sharding | R, never, void>;
/**
 * Register a new topic type, allowing pods to broadcast messages to subscribers.
 * It takes a `behavior` which is a function from a topic and a queue of messages to a ZIO computation that runs forever and consumes those messages.
 * You can use `ZIO.interrupt` from the behavior to stop it (it will be restarted the next time the topic receives a message).
 * If entity goes to idle timeout, it will be interrupted from outside.
 * @since 1.0.0
 * @category utils
 */
export declare function registerTopic<Req, R>(topicType: RecipentType.TopicType<Req>, behavior: RecipientBehaviour.RecipientBehaviour<R, Req>, options?: RecipientBehaviour.EntityBehaviourOptions<R, Req>): Effect.Effect<Sharding | R, never, void>;
/**
 * Get an object that allows sending messages to a given entity type.
 * You can provide a custom send timeout to override the one globally defined.
 * @since 1.0.0
 * @category utils
 */
export declare function messenger<Msg>(entityType: RecipentType.EntityType<Msg>, sendTimeout?: Option.Option<Duration.Duration>): Effect.Effect<Sharding, never, Messenger<Msg>>;
/**
 * Get an object that allows broadcasting messages to a given topic type.
 * You can provide a custom send timeout to override the one globally defined.
 * @since 1.0.0
 * @category utils
 */
export declare function broadcaster<Msg>(topicType: RecipentType.TopicType<Msg>, sendTimeout?: Option.Option<Duration.Duration>): Effect.Effect<Sharding, never, Broadcaster<Msg>>;
/**
 * Get the list of pods currently registered to the Shard Manager
 * @since 1.0.0
 * @category utils
 */
export declare const getPods: Effect.Effect<Sharding, never, HashSet.HashSet<PodAddress.PodAddress>>;
//# sourceMappingURL=Sharding.d.ts.map