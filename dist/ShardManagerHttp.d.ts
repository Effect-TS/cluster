import * as Effect from "@effect/io/Effect";
import * as ManagerConfig from "@effect/shardcake/ManagerConfig";
import * as ShardManager from "@effect/shardcake/ShardManager";
/**
 * @since 1.0.0
 * @category layers
 */
export declare const shardManagerHttp: <R, E, B>(fa: Effect.Effect<R, E, B>) => Effect.Effect<ManagerConfig.ManagerConfig | ShardManager.ShardManager | R, E, B>;
//# sourceMappingURL=ShardManagerHttp.d.ts.map