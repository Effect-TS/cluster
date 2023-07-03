import { Tag } from "@effect/data/Context"
import { pipe } from "@effect/data/Function"
import * as HashMap from "@effect/data/HashMap"
import * as Option from "@effect/data/Option"
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import * as PodAddress from "@effect/shardcake/PodAddress"
import type { WireThrowable } from "@effect/shardcake/ShardError"
import * as ShardId from "@effect/shardcake/ShardId"
import * as ShardingConfig from "@effect/shardcake/ShardingConfig"

export interface ShardManagerClient {
  register(podAddress: PodAddress.PodAddress): Effect.Effect<never, WireThrowable, void>
  unregister(podAddress: PodAddress.PodAddress): Effect.Effect<never, WireThrowable, void>
  notifyUnhealthyPod(podAddress: PodAddress.PodAddress): Effect.Effect<never, WireThrowable, void>
  getAssignments: Effect.Effect<
    never,
    WireThrowable,
    HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
  >
}

export const ShardManagerClient = Tag<ShardManagerClient>()

export const local = pipe(
  Layer.effect(
    ShardManagerClient,
    Effect.gen(function*($) {
      const config = yield* $(ShardingConfig.ShardingConfig)
      const pod = PodAddress.make(config.selfHost, config.shardingPort)
      let shards = HashMap.empty<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>()
      for (let i = 0; i < config.numberOfShards; i++) {
        shards = HashMap.set(shards, ShardId.make(i), Option.some(pod))
      }
      return {
        register: () => Effect.unit(),
        unregister: () => Effect.unit(),
        notifyUnhealthyPod: () => Effect.unit(),
        getAssignments: Effect.succeed(shards)
      } as ShardManagerClient
    })
  )
)
