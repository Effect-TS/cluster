/**
 * @since 1.0.0
 */
import * as ShardingProtocolHttp from "@effect/cluster-node/ShardingProtocolHttp"
import { jsonParse, stringFromUint8ArrayString } from "@effect/cluster-node/utils"
import type * as BinaryMessage from "@effect/cluster/BinaryMessage"
import type * as PodAddress from "@effect/cluster/PodAddress"
import * as Pods from "@effect/cluster/Pods"
import type * as ShardId from "@effect/cluster/ShardId"
import { ShardingErrorPodUnavailable } from "@effect/cluster/ShardingError"
import * as Http from "@effect/platform/HttpClient"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import type * as HashSet from "effect/HashSet"
import * as Layer from "effect/Layer"
import * as Stream from "effect/Stream"

/** @internal */
function asHttpUrl(pod: PodAddress.PodAddress): string {
  return `http://${pod.host}:${pod.port}`
}

/**
 * @since 1.0.0
 * @category layers
 */
export const httpPods = Layer.effect(
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
      }).pipe(Effect.asUnit, Effect.orDie)
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
      }).pipe(Effect.asUnit, Effect.orDie)
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
        Effect.mapError((e) => ShardingErrorPodUnavailable(podAddress))
      )
    }

    function sendMessageStreaming(podAddress: PodAddress.PodAddress, binaryMessage: BinaryMessage.BinaryMessage) {
      return Effect.gen(function*(_) {
        const request = yield* _(
          Http.request.post(
            "/send-message-streaming"
          ),
          Http.request.prependUrl(asHttpUrl(podAddress)),
          Http.request.schemaBody(ShardingProtocolHttp.SendStream_)({
            message: binaryMessage
          })
        )

        const response = yield* _(
          client(request),
          Effect.map((response) => response.stream)
        )

        return pipe(
          response,
          stringFromUint8ArrayString("utf-8"),
          Stream.splitLines,
          Stream.mapEffect((_) => jsonParse(_, ShardingProtocolHttp.SendStreamResultItem_))
        )
      }).pipe(Stream.fromEffect, Stream.flatten(), Stream.orDie, Stream.flatten(), Effect.succeed)
    }

    const result: Pods.Pods = {
      _id: Pods.TypeId,
      assignShards,
      unassignShards,
      ping,
      sendMessageStreaming
    }

    return result
  })
)
