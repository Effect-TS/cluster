import * as Effect from "@effect/io/Effect";
import * as ManagerConfig from "@effect/sharding/ManagerConfig";
import * as ShardManager from "@effect/sharding/ShardManager";
/**
 * @since 1.0.0
 * @category layers
 */
export declare const shardManagerHttp: <R, E, B>(fa: Effect.Effect<R, E, B>) => Effect.Effect<ShardManager.ShardManager | ManagerConfig.ManagerConfig | R, E, B>;
//# sourceMappingURL=ShardManagerHttp.d.ts.map