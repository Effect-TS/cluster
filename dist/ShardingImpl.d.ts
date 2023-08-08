import * as Pods from "@effect/shardcake/Pods";
import * as ShardManagerClient from "@effect/shardcake/ShardManagerClient";
import * as Layer from "@effect/io/Layer";
import * as Serialization from "@effect/shardcake/Serialization";
import * as ShardingConfig from "@effect/shardcake/ShardingConfig";
import * as Storage from "@effect/shardcake/Storage";
import * as Sharding from "./Sharding";
/**
 * @since 1.0.0
 * @category layers
 */
export declare const live: Layer.Layer<ShardingConfig.ShardingConfig | ShardManagerClient.ShardManagerClient | Pods.Pods | Storage.Storage | Serialization.Serialization, never, Sharding.Sharding>;
//# sourceMappingURL=ShardingImpl.d.ts.map