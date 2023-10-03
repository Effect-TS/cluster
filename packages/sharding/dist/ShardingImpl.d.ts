import * as Pods from "@effect/sharding/Pods";
import * as Serialization from "@effect/sharding/Serialization";
import * as ShardingConfig from "@effect/sharding/ShardingConfig";
import * as ShardManagerClient from "@effect/sharding/ShardManagerClient";
import * as Storage from "@effect/sharding/Storage";
import * as Layer from "effect/Layer";
import * as Sharding from "./Sharding";
/**
 * @since 1.0.0
 * @category layers
 */
export declare const live: Layer.Layer<ShardingConfig.ShardingConfig | ShardManagerClient.ShardManagerClient | Pods.Pods | Storage.Storage | Serialization.Serialization, never, Sharding.Sharding>;
//# sourceMappingURL=ShardingImpl.d.ts.map