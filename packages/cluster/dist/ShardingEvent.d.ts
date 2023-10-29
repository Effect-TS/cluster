/**
 * @since 1.0.0
 */
import type * as PodAddress from "@effect/cluster/PodAddress";
import type * as ShardId from "@effect/cluster/ShardId";
import type * as HashSet from "effect/HashSet";
interface ShardsAssigned {
    readonly _tag: "ShardsAssigned";
    readonly pod: PodAddress.PodAddress;
    readonly shards: HashSet.HashSet<ShardId.ShardId>;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardsAssigned(pod: PodAddress.PodAddress, shards: HashSet.HashSet<ShardId.ShardId>): ShardsAssigned;
interface ShardsUnassigned {
    readonly _tag: "ShardsUnassigned";
    readonly pod: PodAddress.PodAddress;
    readonly shards: HashSet.HashSet<ShardId.ShardId>;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function ShardsUnassigned(pod: PodAddress.PodAddress, shards: HashSet.HashSet<ShardId.ShardId>): ShardsUnassigned;
interface PodHealthChecked {
    readonly _tag: "PodHealthChecked";
    readonly pod: PodAddress.PodAddress;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function PodHealthChecked(pod: PodAddress.PodAddress): PodHealthChecked;
interface PodRegistered {
    readonly _tag: "PodRegistered";
    readonly pod: PodAddress.PodAddress;
}
/**
 * @since 1.0.0
 * @category constructors
 */
export declare function PodRegistered(pod: PodAddress.PodAddress): PodRegistered;
interface PodUnregistered {
    readonly _tag: "PodUnregistered";
    readonly pod: PodAddress.PodAddress;
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