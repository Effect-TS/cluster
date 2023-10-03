/**
 * @since 1.0.0
 */
import * as PodAddress from "@effect/sharding/PodAddress";
import * as ShardId from "@effect/sharding/ShardId";
import * as ShardingConfig from "@effect/sharding/ShardingConfig";
import { Tag } from "effect/Context";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
/**
 * @since 1.0.0
 * @category context
 */
export const ShardManagerClient = /*#__PURE__*/Tag();
/**
 * @since 1.0.0
 * @category layers
 */
export const local = /*#__PURE__*/pipe( /*#__PURE__*/Layer.effect(ShardManagerClient, /*#__PURE__*/Effect.gen(function* ($) {
  const config = yield* $(ShardingConfig.ShardingConfig);
  const pod = PodAddress.make(config.selfHost, config.shardingPort);
  let shards = HashMap.empty();
  for (let i = 1; i <= config.numberOfShards; i++) {
    shards = HashMap.set(shards, ShardId.make(i), Option.some(pod));
  }
  return {
    register: () => Effect.unit,
    unregister: () => Effect.unit,
    notifyUnhealthyPod: () => Effect.unit,
    getAssignments: Effect.succeed(shards)
  };
})));
//# sourceMappingURL=ShardManagerClient.mjs.map