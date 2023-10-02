import * as HashSet from "effect/HashSet";
import * as Option from "effect/Option";
import * as Effect from "effect/Effect";
import type * as RecipientBehaviour from "@effect/sharding/RecipientBehaviour";
import type * as RecipientType from "@effect/sharding/RecipientType";
import type * as ReplyChannel from "@effect/sharding/ReplyChannel";
import type * as ReplyId from "@effect/sharding/ReplyId";
import type * as ShardId from "@effect/sharding/ShardId";
import type * as Sharding from "@effect/sharding/Sharding";
import type * as ShardingConfig from "@effect/sharding/ShardingConfig";
import * as ShardingError from "@effect/sharding/ShardingError";
/**
 * @since 1.0.0
 * @category models
 */
export interface EntityManager<Req> {
    readonly send: (entityId: string, req: Req, replyId: Option.Option<ReplyId.ReplyId>, replyChannel: ReplyChannel.ReplyChannel<any>) => Effect.Effect<never, ShardingError.ShardingErrorEntityNotManagedByThisPod | ShardingError.ShardingErrorMessageQueue, void>;
    readonly terminateEntitiesOnShards: (shards: HashSet.HashSet<ShardId.ShardId>) => Effect.Effect<never, never, void>;
    readonly terminateAllEntities: Effect.Effect<never, never, void>;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function make<R, Req>(recipientType: RecipientType.RecipientType<Req>, behaviour_: RecipientBehaviour.RecipientBehaviour<R, Req>, sharding: Sharding.Sharding, config: ShardingConfig.ShardingConfig, options?: RecipientBehaviour.EntityBehaviourOptions<Req>): Effect.Effect<R, never, EntityManager<Req>>;
//# sourceMappingURL=EntityManager.d.ts.map
