import * as ManagerConfig from "@effect/cluster/ManagerConfig";
import * as ShardManager from "@effect/cluster/ShardManager";
import * as Http from "@effect/platform-node/HttpServer";
import * as Layer from "effect/Layer";
/**
 * @since 1.0.0
 * @category layers
 */
export declare const shardManagerHttp: Layer.Layer<ManagerConfig.ManagerConfig | ShardManager.ShardManager, Http.error.ServeError, never>;
//# sourceMappingURL=ShardManagerHttp.d.ts.map