import { Pods } from "@effect/shardcake/Pods";
import { ShardManagerClient } from "@effect/shardcake/ShardManagerClient";
import * as Layer from "@effect/io/Layer";
import * as Serialization from "@effect/shardcake/Serialization";
import * as ShardingConfig from "@effect/shardcake/ShardingConfig";
import * as Storage from "@effect/shardcake/Storage";
import { Sharding } from "./Sharding";
/**
 * @since 1.0.0
 * @category layers
 */
export declare const live: Layer.Layer<Storage.Storage | ShardingConfig.ShardingConfig | ShardManagerClient | Pods | Serialization.Serialization, never, Sharding>;
//# sourceMappingURL=ShardingImpl.d.ts.map