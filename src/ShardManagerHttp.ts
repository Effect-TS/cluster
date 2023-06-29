import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
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
                  return reply(ShardManagerProtocolHttp.RegisterResult_)(
                    Effect.as(shardManager.register(req.pod), true)
                  )
                case "Unregister":
                  return reply(ShardManagerProtocolHttp.UnregisterResult_)(
                    Effect.as(shardManager.unregister(req.pod.address), true)
                  )
                case "NotifyUnhealthyPod":
                  return reply(ShardManagerProtocolHttp.NotifyUnhealthyPodResult_)(
                    Effect.as(shardManager.notifyUnhealthyPod(req.podAddress), true)
                  )
                case "GetAssignments":
                  return reply(ShardManagerProtocolHttp.GetAssignmentsResult_)(
                    Effect.map(shardManager.getAssignments, (_) => Array.from(_))
                  )
              }
            })
          )
        )
      )
    )
  )
