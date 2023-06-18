import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import * as Schema from "@effect/schema/Schema"
import * as ManagerConfig from "@effect/shardcake/ManagerConfig"
import * as ShardManager from "@effect/shardcake/ShardManager"
import * as ShardManagerProtocolHttp from "@effect/shardcake/ShardManagerProtocolHttp"
import { asHttpServer } from "./node"

export const shardManagerHttp = <R, E, B>(fa: Effect.Effect<R, E, B>) =>
  pipe(
    ShardManager.ShardManager,
    Effect.flatMap((shardManager) =>
      pipe(
        ManagerConfig.ManagerConfig,
        Effect.flatMap((managerConfig) =>
          pipe(
            fa,
            asHttpServer(managerConfig.apiPort, ShardManagerProtocolHttp.schema, (req, reply) => {
              switch (req._tag) {
                case "Register":
                  return Effect.zipRight(
                    shardManager.register(req.pod),
                    reply(Schema.boolean, true)
                  )
                case "Unregister":
                  return Effect.zipRight(
                    shardManager.unregister(req.pod.address),
                    reply(Schema.boolean, true)
                  )
                case "NotifyUnhealthyPod":
                  return Effect.zipRight(
                    shardManager.notifyUnhealthyPod(req.podAddress),
                    reply(Schema.boolean, true)
                  )
                case "GetAssignments":
                  return Effect.flatMap(shardManager.getAssignments, (assignments) =>
                    reply(ShardManagerProtocolHttp.GetAssignments_Reply, Array.from(assignments)))
              }
            })
          )
        )
      )
    )
  )
