import { pipe } from "@effect/data/Function"
import * as HashSet from "@effect/data/HashSet"
import * as Effect from "@effect/io/Effect"
import * as Config from "@effect/shardcake/Config"
import * as Sharding from "@effect/shardcake/Sharding"
import * as ShardingProtocolHttp from "@effect/shardcake/ShardingProtocolHttp"
import { asHttpServer } from "./node"

export const shardingServiceHttp = <R, E, B>(fa: Effect.Effect<R, E, B>) =>
  pipe(
    Sharding.Sharding,
    Effect.flatMap((sharding) =>
      pipe(
        Config.Config,
        Effect.flatMap((config) =>
          pipe(
            fa,
            asHttpServer(config.shardingPort, ShardingProtocolHttp.schema, (req, reply) => {
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
                  return reply(ShardingProtocolHttp.SendResult_)(sharding.sendToLocalEntity(req.message))
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
