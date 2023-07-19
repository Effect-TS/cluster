/**
 * @since 1.0.0
 */
import { Tag } from "@effect/data/Context";
import * as HashMap from "@effect/data/HashMap";
import * as Option from "@effect/data/Option";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as PodAddress from "@effect/shardcake/PodAddress";
import * as ShardId from "@effect/shardcake/ShardId";
import * as ShardingConfig from "@effect/shardcake/ShardingConfig";
/**
 * @since 1.0.0
 * @category context
 */
export const ShardManagerClient = /*#__PURE__*/Tag();
/**
 * @since 1.0.0
 * @category layers
 */
export const local = /*#__PURE__*/Layer.effect(ShardManagerClient, /*#__PURE__*/Effect.gen(function* ($) {
  const config = yield* $(ShardingConfig.ShardingConfig);
  const pod = PodAddress.make(config.selfHost, config.shardingPort);
  let shards = HashMap.empty();
  for (let i = 0; i < config.numberOfShards; i++) {
    shards = HashMap.set(shards, ShardId.make(i), Option.some(pod));
  }
  return {
    register: () => Effect.unit,
    unregister: () => Effect.unit,
    notifyUnhealthyPod: () => Effect.unit,
    getAssignments: Effect.succeed(shards)
  };
}));
//# sourceMappingURL=ShardManagerClient.mjs.map