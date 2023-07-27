/**
 * @since 1.0.0
 */
import * as Duration from "@effect/data/Duration";
import * as HashSet from "@effect/data/HashSet";
import * as Option from "@effect/data/Option";
import * as Effect from "@effect/io/Effect";
import * as Queue from "@effect/io/Queue";
import type * as RecipientType from "@effect/shardcake/RecipientType";
import type * as ReplyChannel from "@effect/shardcake/ReplyChannel";
import type * as ReplyId from "@effect/shardcake/ReplyId";
import * as ShardError from "@effect/shardcake/ShardError";
import type * as ShardId from "@effect/shardcake/ShardId";
import type * as Sharding from "@effect/shardcake/Sharding";
import type * as ShardingConfig from "@effect/shardcake/ShardingConfig";
/**
 * @since 1.0.0
 * @category models
 */
export interface EntityManager<Req> {
    send(entityId: string, req: Req, replyId: Option.Option<ReplyId.ReplyId>, replyChannel: ReplyChannel.ReplyChannel<any>): Effect.Effect<never, ShardError.EntityNotManagedByThisPod, void>;
    terminateEntitiesOnShards(shards: HashSet.HashSet<ShardId.ShardId>): Effect.Effect<never, never, void>;
    terminateAllEntities: Effect.Effect<never, never, void>;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function make<R, Req>(recipientType: RecipientType.RecipientType<Req>, behavior_: (entityId: string, dequeue: Queue.Dequeue<Req>) => Effect.Effect<R, never, void>, interruptible: boolean, sharding: Sharding.Sharding, config: ShardingConfig.ShardingConfig, entityMaxIdle: Option.Option<Duration.Duration>): Effect.Effect<R, never, EntityManager<Req>>;
//# sourceMappingURL=EntityManager.d.ts.map