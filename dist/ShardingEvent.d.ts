/**
 * @since 1.0.0
 */
import type * as HashSet from "@effect/data/HashSet";
import type * as PodAddress from "@effect/shardcake/PodAddress";
import type * as ShardId from "@effect/shardcake/ShardId";
interface ShardsAssigned {
    _tag: "ShardsAssigned";
    pod: PodAddress.PodAddress;
    shards: HashSet.HashSet<ShardId.ShardId>;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardsAssigned(pod: PodAddress.PodAddress, shards: HashSet.HashSet<ShardId.ShardId>): ShardsAssigned;
interface ShardsUnassigned {
    _tag: "ShardsUnassigned";
    pod: PodAddress.PodAddress;
    shards: HashSet.HashSet<ShardId.ShardId>;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardsUnassigned(pod: PodAddress.PodAddress, shards: HashSet.HashSet<ShardId.ShardId>): ShardsUnassigned;
interface PodHealthChecked {
    _tag: "PodHealthChecked";
    pod: PodAddress.PodAddress;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function PodHealthChecked(pod: PodAddress.PodAddress): PodHealthChecked;
interface PodRegistered {
    _tag: "PodRegistered";
    pod: PodAddress.PodAddress;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function PodRegistered(pod: PodAddress.PodAddress): PodRegistered;
interface PodUnregistered {
    _tag: "PodUnregistered";
    pod: PodAddress.PodAddress;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function PodUnregistered(pod: PodAddress.PodAddress): PodUnregistered;
/**
 * @since 1.0.0
 * @category models
 */
export type ShardingEvent = ShardsAssigned | ShardsUnassigned | PodHealthChecked | PodRegistered | PodUnregistered;
export {};
//# sourceMappingURL=ShardingEvent.d.ts.map