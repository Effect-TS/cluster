import * as Effect from "@effect/io/Effect";
import * as Sharding from "@effect/shardcake/Sharding";
import * as ShardingConfig from "@effect/shardcake/ShardingConfig";
/**
 * @since 1.0.0
 * @category layers
 */
export declare const shardingServiceHttp: <R, E, B>(fa: Effect.Effect<R, E, B>) => Effect.Effect<Sharding.Sharding | R | ShardingConfig.ShardingConfig, E, B>;
//# sourceMappingURL=ShardingServiceHttp.d.ts.map