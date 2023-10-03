/**
 * @since 1.0.0
 */
import type * as Pod from "@effect/sharding/Pod";
import type * as PodAddress from "@effect/sharding/PodAddress";
import type * as ShardId from "@effect/sharding/ShardId";
import { Tag } from "effect/Context";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import type * as Option from "effect/Option";
import * as Stream from "effect/Stream";
/**
 * @since 1.0.0
 * @category symbols
 */
export declare const TypeId: unique symbol;
/**
 * @since 1.0.0
 * @category symbols
 */
export type TypeId = typeof TypeId;
/**
 * @since 1.0.0
 * @category models
 */
export interface Storage {
    /**
     * Get the current state of shard assignments to pods
     */
    readonly getAssignments: Effect.Effect<never, never, HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>>;
    /**
     * Save the current state of shard assignments to pods
     */
    readonly saveAssignments: (assignments: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>) => Effect.Effect<never, never, void>;
    /**
     * A stream that will emit the state of shard assignments whenever it changes
     */
    readonly assignmentsStream: Stream.Stream<never, never, HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>>;
    /**
     * Get the list of existing pods
     */
    readonly getPods: Effect.Effect<never, never, HashMap.HashMap<PodAddress.PodAddress, Pod.Pod>>;
    /**
     * Save the list of existing pods
     */
    readonly savePods: (pods: HashMap.HashMap<PodAddress.PodAddress, Pod.Pod>) => Effect.Effect<never, never, void>;
}
/**
 * @since 1.0.0
 * @category context
 */
export declare const Storage: Tag<Storage, Storage>;
/**
 * A layer that stores data in-memory.
 * This is useful for testing with a single pod only.
 *
 * @since 1.0.0
 * @category layers
 */
export declare const memory: Layer.Layer<never, never, Storage>;
/**
 * A layer that does nothing, useful for testing.
 *
 * @since 1.0.0
 * @category layers
 */
export declare const noop: Layer.Layer<never, never, Storage>;
//# sourceMappingURL=Storage.d.ts.map