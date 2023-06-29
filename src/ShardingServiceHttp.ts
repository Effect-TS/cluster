import * as Either from "@effect/data/Either"
import { pipe } from "@effect/data/Function"
import * as HashSet from "@effect/data/HashSet"
import * as Effect from "@effect/io/Effect"
import * as Schema from "@effect/schema/Schema"
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
                  return Effect.zipRight(
                    sharding.assign(HashSet.fromIterable(req.shards)),
                    reply(Schema.boolean, true)
                  )
                case "UnassignShards":
                  return Effect.zipRight(
                    sharding.unassign(HashSet.fromIterable(req.shards)),
                    reply(Schema.boolean, true)
                  )
                case "Send":
                  return pipe(
                    sharding.sendToLocalEntity(req.message),
                    Effect.flatMap((res) => reply(ShardingProtocolHttp.SendResult_, Either.right(res))),
                    Effect.catchAll((e) => reply(ShardingProtocolHttp.SendResult_, Either.left(e)))
                  )
                case "PingShards":
                  return reply(Schema.boolean, true)
              }
              return Effect.die("Unhandled")
            })
          )
        )
      )
    )
  )
