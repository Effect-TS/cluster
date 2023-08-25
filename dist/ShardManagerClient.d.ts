/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context";
import * as HashMap from "@effect/data/HashMap";
import * as Option from "@effect/data/Option";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as PodAddress from "@effect/sharding/PodAddress";
import * as ShardId from "@effect/sharding/ShardId";
import * as ShardingConfig from "@effect/sharding/ShardingConfig";
/**
 * @since 1.0.0
 * @category models
 */
export interface ShardManagerClient {
    readonly register: (podAddress: PodAddress.PodAddress) => Effect.Effect<never, never, void>;
    readonly unregister: (podAddress: PodAddress.PodAddress) => Effect.Effect<never, never, void>;
    readonly notifyUnhealthyPod: (podAddress: PodAddress.PodAddress) => Effect.Effect<never, never, void>;
    readonly getAssignments: Effect.Effect<never, never, HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>>;
}
/**
 * @since 1.0.0
 * @category context
 */
export declare const ShardManagerClient: Tag<ShardManagerClient, ShardManagerClient>;
/**
 * @since 1.0.0
 * @category layers
 */
export declare const local: Layer.Layer<ShardingConfig.ShardingConfig, never, ShardManagerClient>;
//# sourceMappingURL=ShardManagerClient.d.ts.map