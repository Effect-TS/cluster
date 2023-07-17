/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context";
import * as HashMap from "@effect/data/HashMap";
import type * as Option from "@effect/data/Option";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import type * as Pod from "@effect/shardcake/Pod";
import type * as PodAddress from "@effect/shardcake/PodAddress";
import type * as ShardId from "@effect/shardcake/ShardId";
import * as Stream from "@effect/stream/Stream";
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
    getAssignments: Effect.Effect<never, never, HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>>;
    /**
     * Save the current state of shard assignments to pods
     */
    saveAssignments(assignments: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>): Effect.Effect<never, never, void>;
    /**
     * A stream that will emit the state of shard assignments whenever it changes
     */
    assignmentsStream: Stream.Stream<never, never, HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>>;
    /**
     * Get the list of existing pods
     */
    getPods: Effect.Effect<never, never, HashMap.HashMap<PodAddress.PodAddress, Pod.Pod>>;
    /**
     * Save the list of existing pods
     */
    savePods(pods: HashMap.HashMap<PodAddress.PodAddress, Pod.Pod>): Effect.Effect<never, never, void>;
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