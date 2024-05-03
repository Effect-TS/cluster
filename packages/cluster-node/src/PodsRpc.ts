/**
 * @since 1.0.0
 */
import type * as PodAddress from "@effect/cluster/PodAddress"
import * as Pods from "@effect/cluster/Pods"
import type * as SerializedEnvelope from "@effect/cluster/SerializedEnvelope"
import type * as ShardId from "@effect/cluster/ShardId"
import * as ShardingException from "@effect/cluster/ShardingException"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import type * as HashSet from "effect/HashSet"
import * as Layer from "effect/Layer"
import type * as Request from "effect/Request"
import * as ShardingProtocol from "./ShardingProtocol.js"
import type * as ShardingServiceRpc from "./ShardingServiceRpc.js"

/**
 * Given a function that resolves an RPC client, constructs a Pods service that uses RPC to communicate
 * @since 1.0.0
 * @category layers
 */
export function podsRpc<R>(
  buildClient: (
    podAddress: PodAddress.PodAddress
  ) => <A extends ShardingServiceRpc.ShardingServiceRpcRequest>(
    request: A
  ) => Effect.Effect<Request.Request.Success<A>, Request.Request.Error<A>, R>
): Layer.Layer<Pods.Pods, never, R> {
  return Layer.effect(Pods.Pods)(
    Effect.gen(function*() {
      const env = yield* Effect.context<R>()

      function assignShards(podAddress: PodAddress.PodAddress, shards: HashSet.HashSet<ShardId.ShardId>) {
        return buildClient(podAddress)(new ShardingProtocol.AssignShards({ shards })).pipe(
          Effect.provide(env),
          Effect.catchAllCause((e) => Effect.logError(e))
        )
      }

      function unassignShards(podAddress: PodAddress.PodAddress, shards: HashSet.HashSet<ShardId.ShardId>) {
        return buildClient(podAddress)(new ShardingProtocol.UnassignShards({ shards })).pipe(
          Effect.provide(env),
          Effect.catchAllCause((e) => Effect.logError(e))
        )
      }

      function ping(podAddress: PodAddress.PodAddress) {
        return buildClient(podAddress)(new ShardingProtocol.PingShard()).pipe(
          Effect.provide(env),
          Effect.catchAllCause((e) =>
            pipe(
              Effect.logError(e),
              Effect.zipRight(
                Effect.fail(new ShardingException.PodUnavailableException({ podAddress }))
              )
            )
          )
        )
      }

      function sendAndGetState(podAddress: PodAddress.PodAddress, envelope: SerializedEnvelope.SerializedEnvelope) {
        return buildClient(podAddress)(new ShardingProtocol.Send({ envelope })).pipe(Effect.provide(env))
      }

      return Pods.make({
        assignShards,
        unassignShards,
        ping,
        sendAndGetState
      })
    })
  )
}
