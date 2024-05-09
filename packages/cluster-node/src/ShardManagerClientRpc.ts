/**
 * @since 1.0.0
 */
import * as Pod from "@effect/cluster/Pod"
import * as ShardingConfig from "@effect/cluster/ShardingConfig"
import * as ShardManagerClient from "@effect/cluster/ShardManagerClient"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import type * as Request from "effect/Request"
import * as ShardManagerProtocol from "./ShardManagerProtocol.js"
import type * as ShardManagerServiceRpc from "./ShardManagerServiceRpc.js"

export function shardManagerClientRpc(
  makeClient: (shardManagerUri: string) => <A extends ShardManagerServiceRpc.ShardManagerServiceRpcRequest>(
    request: A
  ) => Effect.Effect<Request.Request.Success<A>, Request.Request.Error<A>, never>
) {
  return Layer.effect(
    ShardManagerClient.ShardManagerClient,
    Effect.gen(function*(_) {
      const config = yield* _(ShardingConfig.ShardingConfig)
      const client = makeClient(config.shardManagerUri)

      return ShardManagerClient.make({
        register: (podAddress) =>
          client(new ShardManagerProtocol.Register({ pod: Pod.make(podAddress, config.serverVersion) })),
        unregister: (podAddress) => client(new ShardManagerProtocol.Unregister({ podAddress })),
        notifyUnhealthyPod: (podAddress) => client(new ShardManagerProtocol.NotifyUnhealthyPod({ podAddress })),
        getAssignments: client(new ShardManagerProtocol.GetAssignements())
      })
    })
  )
}
