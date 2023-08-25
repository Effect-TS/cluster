/**
 * @since 1.0.0
 */
import { pipe } from "@effect/data/Function"
import * as HashMap from "@effect/data/HashMap"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import * as Pod from "@effect/sharding/Pod"
import * as ShardingConfig from "@effect/sharding/ShardingConfig"
import * as ShardManagerClient from "@effect/sharding/ShardManagerClient"
import * as ShardManagerProtocolHttp from "@effect/sharding/ShardManagerProtocolHttp"
import { send } from "./utils"

/**
 * @since 1.0.0
 * @category layers
 */
export const shardManagerClientHttp = Layer.effect(
  ShardManagerClient.ShardManagerClient,
  pipe(
    ShardingConfig.ShardingConfig,
    Effect.map(
      (config) => ({
        register: (podAddress) =>
          send(ShardManagerProtocolHttp.Register_, ShardManagerProtocolHttp.RegisterResult_)(config.shardManagerUri, {
            _tag: "Register",
            pod: Pod.make(podAddress, config.serverVersion)
          }),
        unregister: (podAddress) =>
          send(ShardManagerProtocolHttp.Unregister_, ShardManagerProtocolHttp.UnregisterResult_)(
            config.shardManagerUri,
            {
              _tag: "Unregister",
              pod: Pod.make(podAddress, config.serverVersion)
            }
          ),
        notifyUnhealthyPod: (podAddress) =>
          send(ShardManagerProtocolHttp.NotifyUnhealthyPod_, ShardManagerProtocolHttp.NotifyUnhealthyPodResult_)(
            config.shardManagerUri,
            {
              _tag: "NotifyUnhealthyPod",
              podAddress
            }
          ),
        getAssignments: pipe(
          send(
            ShardManagerProtocolHttp.GetAssignments_,
            ShardManagerProtocolHttp.GetAssignmentsResult_
          )(config.shardManagerUri, {
            _tag: "GetAssignments"
          }),
          Effect.map((data) => HashMap.fromIterable(data))
        )
      } as ShardManagerClient.ShardManagerClient)
    )
  )
)
