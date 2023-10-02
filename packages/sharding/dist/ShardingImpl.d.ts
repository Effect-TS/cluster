import * as Layer from "effect/Layer";
import * as Pods from "@effect/sharding/Pods";
import * as Serialization from "@effect/sharding/Serialization";
import * as ShardingConfig from "@effect/sharding/ShardingConfig";
import * as ShardManagerClient from "@effect/sharding/ShardManagerClient";
import * as Storage from "@effect/sharding/Storage";
import * as Sharding from "./Sharding";
/**
 * @since 1.0.0
 * @category layers
 */
export declare const live: Layer.Layer<ShardingConfig.ShardingConfig | Pods.Pods | Serialization.Serialization | Storage.Storage | ShardManagerClient.ShardManagerClient, never, Sharding.Sharding>;
//# sourceMappingURL=ShardingImpl.d.ts.map
