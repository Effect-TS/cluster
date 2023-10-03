/**
 * @since 1.0.0
 */
import * as Http from "@effect/platform/HttpClient"
import * as ShardingProtocolHttp from "@effect/sharding-node/ShardingProtocolHttp"
import { jsonParse, stringFromUint8ArrayString } from "@effect/sharding-node/utils"
import type * as BinaryMessage from "@effect/sharding/BinaryMessage"
import type * as PodAddress from "@effect/sharding/PodAddress"
import * as Pods from "@effect/sharding/Pods"
import type * as ShardId from "@effect/sharding/ShardId"
import { ShardingErrorPodUnavailable } from "@effect/sharding/ShardingError"
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
        Effect.mapError((e) => {
          console.log("error is ", e)
          return ShardingErrorPodUnavailable(podAddress)
        })
      )
    }

    function sendMessage(podAddress: PodAddress.PodAddress, binaryMessage: BinaryMessage.BinaryMessage) {
      return Effect.gen(function*(_) {
        const request = yield* _(
          Http.request.post(
            "/send-message"
          ),
          Http.request.prependUrl(asHttpUrl(podAddress)),
          Http.request.schemaBody(ShardingProtocolHttp.Send_)({
            message: binaryMessage
          })
        )

        const response = yield* _(
          client(request),
          Effect.flatMap(Http.response.schemaBodyJson(ShardingProtocolHttp.SendResult_))
        )

        return response
      }).pipe(Effect.orDie, Effect.flatten)
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
      }).pipe(Stream.fromEffect, Stream.flatten(), Stream.orDie, Stream.flatten())
    }

    const result: Pods.Pods = {
      _id: Pods.TypeId,
      assignShards,
      unassignShards,
      ping,
      sendMessage,
      sendMessageStreaming
    }

    return result
  })
)
