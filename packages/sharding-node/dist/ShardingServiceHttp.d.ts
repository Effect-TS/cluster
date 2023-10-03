/**
 * @since 1.0.0
 */
import * as Http from "@effect/platform-node/HttpServer";
import * as Sharding from "@effect/sharding/Sharding";
import * as ShardingConfig from "@effect/sharding/ShardingConfig";
import * as Layer from "effect/Layer";
/**
 * @since 1.0.0
 * @category layers
 */
export declare const shardingServiceHttp: Layer.Layer<ShardingConfig.ShardingConfig | Sharding.Sharding, Http.error.ServeError, never>;
//# sourceMappingURL=ShardingServiceHttp.d.ts.map