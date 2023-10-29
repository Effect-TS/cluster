import type * as Message from "@effect/cluster/Message";
import * as RecipientBehaviour from "@effect/cluster/RecipientBehaviour";
import type * as RecipientType from "@effect/cluster/RecipientType";
import type * as ReplyId from "@effect/cluster/ReplyId";
import type * as ShardId from "@effect/cluster/ShardId";
import type * as Sharding from "@effect/cluster/Sharding";
import type * as ShardingConfig from "@effect/cluster/ShardingConfig";
import * as ShardingError from "@effect/cluster/ShardingError";
import * as Effect from "effect/Effect";
import * as HashSet from "effect/HashSet";
import * as Option from "effect/Option";
/**
 * @since 1.0.0
 * @category models
 */
export interface EntityManager<Req> {
    readonly recipientType: RecipientType.RecipientType<Req>;
    readonly send: <A extends Req>(entityId: string, req: A, replyId: Option.Option<ReplyId.ReplyId>) => Effect.Effect<never, ShardingError.ShardingErrorEntityNotManagedByThisPod | ShardingError.ShardingErrorPodUnavailable | ShardingError.ShardingErrorMessageQueue, Option.Option<Message.Success<A>>>;
    readonly terminateEntitiesOnShards: (shards: HashSet.HashSet<ShardId.ShardId>) => Effect.Effect<never, never, void>;
    readonly terminateAllEntities: Effect.Effect<never, never, void>;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function make<R, Req>(recipientType: RecipientType.RecipientType<Req>, behaviour_: RecipientBehaviour.RecipientBehaviour<R, Req>, sharding: Sharding.Sharding, config: ShardingConfig.ShardingConfig, options?: RecipientBehaviour.EntityBehaviourOptions<Req>): Effect.Effect<Exclude<R, RecipientBehaviour.RecipientBehaviourContext>, never, EntityManager<Req>>;
//# sourceMappingURL=EntityManager.d.ts.map