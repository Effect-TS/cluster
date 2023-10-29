/**
 * @since 1.0.0
 */
import * as PodAddress from "@effect/cluster/PodAddress"
import * as ShardId from "@effect/cluster/ShardId"
import * as ShardingConfig from "@effect/cluster/ShardingConfig"
import { Tag } from "effect/Context"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as HashMap from "effect/HashMap"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"

/**
 * @since 1.0.0
 * @category models
 */
export interface ShardManagerClient {
  readonly register: (podAddress: PodAddress.PodAddress) => Effect.Effect<never, never, void>
  readonly unregister: (podAddress: PodAddress.PodAddress) => Effect.Effect<never, never, void>
  readonly notifyUnhealthyPod: (podAddress: PodAddress.PodAddress) => Effect.Effect<never, never, void>
  readonly getAssignments: Effect.Effect<
    never,
    never,
    HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
  >
}

/**
 * @since 1.0.0
 * @category context
 */
export const ShardManagerClient = Tag<ShardManagerClient>()

/**
 * @since 1.0.0
 * @category layers
 */
export const local = pipe(
  Layer.effect(
    ShardManagerClient,
    Effect.gen(function*($) {
      const config = yield* $(ShardingConfig.ShardingConfig)
      const pod = PodAddress.make(config.selfHost, config.shardingPort)
      let shards = HashMap.empty<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>()
      for (let i = 1; i <= config.numberOfShards; i++) {
        shards = HashMap.set(shards, ShardId.make(i), Option.some(pod))
      }
      return {
        register: () => Effect.unit,
        unregister: () => Effect.unit,
        notifyUnhealthyPod: () => Effect.unit,
        getAssignments: Effect.succeed(shards)
      } as ShardManagerClient
    })
  )
)
