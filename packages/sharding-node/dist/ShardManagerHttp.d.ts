import * as Layer from "effect/Layer";
import * as Http from "@effect/platform-node/HttpServer";
import * as ManagerConfig from "@effect/sharding/ManagerConfig";
import * as ShardManager from "@effect/sharding/ShardManager";
/**
 * @since 1.0.0
 * @category layers
 */
export declare const shardManagerHttp: Layer.Layer<ManagerConfig.ManagerConfig | ShardManager.ShardManager, Http.error.ServeError, never>;
//# sourceMappingURL=ShardManagerHttp.d.ts.map
