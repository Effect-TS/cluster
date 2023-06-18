import { pipe } from "@effect/data/Function"
import * as HashMap from "@effect/data/HashMap"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import * as Schema from "@effect/schema/Schema"
import * as Config from "@effect/shardcake/Config"
import * as Pod from "@effect/shardcake/Pod"
import * as ShardManagerClient from "@effect/shardcake/ShardManagerClient"
import * as ShardManagerProtocolHttp from "@effect/shardcake/ShardManagerProtocolHttp"
import { send } from "./utils"

export const shardManagerClientHttp = Layer.effect(
  ShardManagerClient.ShardManagerClient,
  pipe(
    Config.Config,
    Effect.map(
      (config) => ({
        register: (podAddress) =>
          send(ShardManagerProtocolHttp.Register_, Schema.boolean)(config.shardManagerUri, {
            _tag: "Register",
            pod: Pod.pod(podAddress, config.serverVersion)
          }),
        unregister: (podAddress) =>
          send(ShardManagerProtocolHttp.Unregister_, Schema.boolean)(config.shardManagerUri, {
            _tag: "Unregister",
            pod: Pod.pod(podAddress, config.serverVersion)
          }),
        notifyUnhealthyPod: (podAddress) =>
          send(ShardManagerProtocolHttp.NotifyUnhealthyPod_, Schema.boolean)(
            config.shardManagerUri,
            {
              _tag: "NotifyUnhealthyPod",
              podAddress
            }
          ),
        getAssignments: pipe(
          send(
            ShardManagerProtocolHttp.GetAssignments_,
            ShardManagerProtocolHttp.GetAssignments_Reply
          )(config.shardManagerUri, {
            _tag: "GetAssignments"
          }),
          Effect.map((data) => HashMap.fromIterable(data))
        )
      } as ShardManagerClient.ShardManagerClient)
    )
  )
)
