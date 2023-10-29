import * as Sharding from "@effect/cluster/Sharding";
import * as ShardingConfig from "@effect/cluster/ShardingConfig";
import * as Http from "@effect/platform-node/HttpServer";
import * as Layer from "effect/Layer";
/**
 * @since 1.0.0
 * @category layers
 */
export declare const shardingServiceHttp: Layer.Layer<ShardingConfig.ShardingConfig | Sharding.Sharding, Http.error.ServeError, never>;
//# sourceMappingURL=ShardingServiceHttp.d.ts.map