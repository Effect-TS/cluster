/**
 * @since 1.0.0
 */
import type * as PodAddress from "@effect/cluster/PodAddress"
import * as Pods from "@effect/cluster/Pods"
import type * as SerializedEnvelope from "@effect/cluster/SerializedEnvelope"
import type * as ShardId from "@effect/cluster/ShardId"
import * as ShardingException from "@effect/cluster/ShardingException"
import * as Http from "@effect/platform/HttpClient"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import type * as HashSet from "effect/HashSet"
import * as Layer from "effect/Layer"
import * as ShardingProtocolHttp from "./ShardingProtocolHttp.js"

/** @internal */
function asHttpUrl(pod: PodAddress.PodAddress): string {
  return `http://${pod.host}:${pod.port}`
}

/**
 * @since 1.0.0
 * @category layers
 */
export const httpPods: Layer.Layer<Pods.Pods, never, Http.client.Client.Default> = Layer.effect(
  Pods.Pods,
  Effect.gen(function*(_) {
    const client = yield* _(Http.client.Client, Effect.map(Http.client.filterStatusOk))

    function assignShards(podAddress: PodAddress.PodAddress, shards: HashSet.HashSet<ShardId.ShardId>) {
      return Effect.gen(function*(_) {
        const request = yield* _(
          Http.request.post(
            "/assign-shards"
          ),
          Http.request.prependUrl(asHttpUrl(podAddress)),
          Http.request.schemaBody(ShardingProtocolHttp.AssignShard_)({
            shards: Array.from(shards)
          })
        )

        return yield* _(client(request))
      }).pipe(Effect.asUnit, Effect.scoped, Effect.orDie)
    }

    function unassignShards(podAddress: PodAddress.PodAddress, shards: HashSet.HashSet<ShardId.ShardId>) {
      return Effect.gen(function*(_) {
        const request = yield* _(
          Http.request.post(
            "/unassign-shards"
          ),
          Http.request.prependUrl(asHttpUrl(podAddress)),
          Http.request.schemaBody(ShardingProtocolHttp.UnassignShards_)({
            shards: Array.from(shards)
          })
        )

        return yield* _(client(request))
      }).pipe(Effect.asUnit, Effect.scoped, Effect.orDie)
    }

    function ping(podAddress: PodAddress.PodAddress) {
      return Effect.gen(function*(_) {
        const request = pipe(
          Http.request.get(
            "/ping"
          ),
          Http.request.prependUrl(asHttpUrl(podAddress))
        )

        return yield* _(client(request))
      }).pipe(
        Effect.asUnit,
        Effect.mapError(() => new ShardingException.PodUnavailableException({ podAddress })),
        Effect.scoped
      )
    }

    function sendAndGetState(podAddress: PodAddress.PodAddress, envelope: SerializedEnvelope.SerializedEnvelope) {
      return Effect.gen(function*(_) {
        const request = yield* _(
          Http.request.post(
            "/send-message"
          ),
          Http.request.prependUrl(asHttpUrl(podAddress)),
          Http.request.schemaBody(ShardingProtocolHttp.Send_)({
            message: envelope
          })
        )

        const response = yield* _(
          client(request),
          Effect.flatMap(Http.response.schemaBodyJson(ShardingProtocolHttp.SendResult_))
        )

        return response
      }).pipe(
        Effect.matchEffect({
          onSuccess: (e) => Effect.succeed(e),
          onFailure: (error) =>
            error._tag === "RequestError"
              ? Effect.fail(new ShardingException.PodUnavailableException({ podAddress }))
              : Effect.die(error)
        }),
        Effect.flatten,
        Effect.scoped
      )
    }

    return Pods.make({
      assignShards,
      unassignShards,
      ping,
      sendAndGetState
    })
  })
)
