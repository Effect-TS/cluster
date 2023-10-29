import * as Pods from "@effect/cluster/Pods";
import * as Serialization from "@effect/cluster/Serialization";
import * as Sharding from "@effect/cluster/Sharding";
import * as ShardingConfig from "@effect/cluster/ShardingConfig";
import * as ShardManagerClient from "@effect/cluster/ShardManagerClient";
import * as Storage from "@effect/cluster/Storage";
import * as Layer from "effect/Layer";
/**
 * @since 1.0.0
 * @category layers
 */
export declare const live: Layer.Layer<ShardingConfig.ShardingConfig | Pods.Pods | Serialization.Serialization | Storage.Storage | ShardManagerClient.ShardManagerClient, never, Sharding.Sharding>;
//# sourceMappingURL=ShardingImpl.d.ts.map