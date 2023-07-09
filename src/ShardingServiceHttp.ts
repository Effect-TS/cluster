/**
 * @since 1.0.0
 */
import { pipe } from "@effect/data/Function"
import * as HashSet from "@effect/data/HashSet"
import * as Effect from "@effect/io/Effect"
import { isEntityTypeNotRegistered } from "@effect/shardcake/ShardError"
import * as Sharding from "@effect/shardcake/Sharding"
import * as ShardingConfig from "@effect/shardcake/ShardingConfig"
import * as ShardingProtocolHttp from "@effect/shardcake/ShardingProtocolHttp"
import * as Stream from "@effect/stream/Stream"
import { asHttpServer } from "./node"

/**
 * @since 1.0.0
 * @category layers
 */
export const shardingServiceHttp = <R, E, B>(fa: Effect.Effect<R, E, B>) =>
  pipe(
    Sharding.Sharding,
    Effect.flatMap((sharding) =>
      pipe(
        ShardingConfig.ShardingConfig,
        Effect.flatMap((config) =>
          pipe(
            fa,
            asHttpServer(config.shardingPort, ShardingProtocolHttp.schema, (req, reply, replyStream) => {
              switch (req._tag) {
                case "AssignShards":
                  return reply(ShardingProtocolHttp.AssignShardResult_)(
                    Effect.as(sharding.assign(HashSet.fromIterable(req.shards)), true)
                  )
                case "UnassignShards":
                  return reply(ShardingProtocolHttp.UnassignShardsResult_)(
                    Effect.as(sharding.unassign(HashSet.fromIterable(req.shards)), true)
                  )
                case "Send":
                  return reply(ShardingProtocolHttp.SendResult_)(pipe(
                    sharding.sendToLocalEntitySingleReply(req.message),
                    Effect.catchAll((e) => isEntityTypeNotRegistered(e) ? Effect.fail(e) : Effect.die(e))
                  ))
                case "SendStream":
                  return replyStream(ShardingProtocolHttp.SendStreamResultItem_)(pipe(
                    sharding.sendToLocalEntityStreamingReply(req.message),
                    Stream.catchAll((e) => isEntityTypeNotRegistered(e) ? Stream.fail(e) : Stream.die(e))
                  ))
                case "PingShards":
                  return reply(ShardingProtocolHttp.PingShardsResult_)(Effect.succeed(true))
              }
              return Effect.die("Unhandled")
            })
          )
        )
      )
    )
  )
