/**
 * @since 1.0.0
 */

import * as HashSet from "@effect/data/HashSet";
import * as Effect from "@effect/io/Effect";
import * as Sharding from "@effect/shardcake/Sharding";
import * as ShardingConfig from "@effect/shardcake/ShardingConfig";
import { isShardingEntityTypeNotRegisteredError } from "@effect/shardcake/ShardingError";
import * as ShardingProtocolHttp from "@effect/shardcake/ShardingProtocolHttp";
import * as Stream from "@effect/stream/Stream";
import { asHttpServer } from "./node";
/**
 * @since 1.0.0
 * @category layers
 */
export const shardingServiceHttp = fa => Effect.flatMap(sharding => Effect.flatMap(config => asHttpServer(config.shardingPort, ShardingProtocolHttp.schema, (req, reply, replyStream) => {
  switch (req._tag) {
    case "AssignShards":
      return reply(ShardingProtocolHttp.AssignShardResult_)(Effect.as(sharding.assign(HashSet.fromIterable(req.shards)), true));
    case "UnassignShards":
      return reply(ShardingProtocolHttp.UnassignShardsResult_)(Effect.as(sharding.unassign(HashSet.fromIterable(req.shards)), true));
    case "Send":
      return reply(ShardingProtocolHttp.SendResult_)(Effect.catchAll(e => isShardingEntityTypeNotRegisteredError(e) ? Effect.fail(e) : Effect.die(e))(sharding.sendToLocalEntitySingleReply(req.message)));
    case "SendStream":
      return replyStream(ShardingProtocolHttp.SendStreamResultItem_)(Stream.catchAll(e => isShardingEntityTypeNotRegisteredError(e) ? Stream.fail(e) : Stream.die(e))(sharding.sendToLocalEntityStreamingReply(req.message)));
    case "PingShards":
      return reply(ShardingProtocolHttp.PingShardsResult_)(Effect.succeed(true));
  }
  return Effect.die("Unhandled");
})(fa))(ShardingConfig.ShardingConfig))(Sharding.Sharding);
//# sourceMappingURL=ShardingServiceHttp.mjs.map