/**
 * @since 1.0.0
 */
import { pipe } from "@effect/data/Function"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import * as ShardingProtocolHttp from "@effect/sharding-node/ShardingProtocolHttp"
import type * as PodAddress from "@effect/sharding/PodAddress"
import * as Pods from "@effect/sharding/Pods"
import { ShardingPodUnavailableError } from "@effect/sharding/ShardingError"
import * as Stream from "@effect/stream/Stream"
import { isFetchError, send, sendStream } from "./utils"

/** @internal */
function asHttpUrl(pod: PodAddress.PodAddress): string {
  return `http://${pod.host}:${pod.port}/`
}

/**
 * @since 1.0.0
 * @category layers
 */
export const httpPods = Layer.succeed(Pods.Pods, {
  _id: Pods.TypeId,
  assignShards: (pod, shards) =>
    pipe(
      send(ShardingProtocolHttp.AssignShard_, ShardingProtocolHttp.AssignShardResult_)(asHttpUrl(pod), {
        _tag: "AssignShards",
        shards: Array.from(shards)
      }),
      Effect.orDie
    ),
  unassignShards: (pod, shards) =>
    pipe(
      send(ShardingProtocolHttp.UnassignShards_, ShardingProtocolHttp.UnassignShardsResult_)(asHttpUrl(pod), {
        _tag: "UnassignShards",
        shards: Array.from(shards)
      }),
      Effect.orDie
    ),
  ping: (pod) =>
    pipe(
      send(ShardingProtocolHttp.PingShards_, ShardingProtocolHttp.PingShardsResult_)(asHttpUrl(pod), {
        _tag: "PingShards"
      }),
      Effect.catchAllDefect((e) => {
        if (isFetchError(e)) {
          return Effect.fail(ShardingPodUnavailableError(pod))
        }
        return Effect.die(e)
      })
    ),
  sendMessage: (pod, message) =>
    pipe(
      send(ShardingProtocolHttp.Send_, ShardingProtocolHttp.SendResult_)(asHttpUrl(pod), {
        _tag: "Send",
        message
      }),
      Effect.orDie
    ),
  sendMessageStreaming: (pod, message) =>
    pipe(
      sendStream(ShardingProtocolHttp.SendStream_, ShardingProtocolHttp.SendStreamResultItem_)(asHttpUrl(pod), {
        _tag: "SendStream",
        message
      }),
      Stream.orDie
    )
})
