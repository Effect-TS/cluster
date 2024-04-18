/**
 * @since 1.0.0
 */
import * as Pod from "@effect/cluster/Pod"
import * as ShardingConfig from "@effect/cluster/ShardingConfig"
import * as ShardManagerClient from "@effect/cluster/ShardManagerClient"
import * as Http from "@effect/platform/HttpClient"
import * as Effect from "effect/Effect"
import { pipe } from "effect/Function"
import * as HashMap from "effect/HashMap"
import * as Layer from "effect/Layer"
import * as ShardManagerProtocolHttp from "./ShardManagerProtocolHttp.js"

/**
 * @since 1.0.0
 * @category layers
 */
export const shardManagerClientHttp = Layer.effect(
  ShardManagerClient.ShardManagerClient,
  Effect.gen(function*(_) {
    const config = yield* _(ShardingConfig.ShardingConfig)
    const client = yield* _(Http.client.Client, Effect.map(Http.client.filterStatusOk))

    return ShardManagerClient.make({
      register: (podAddress) =>
        Effect.gen(function*(_) {
          const request = yield* _(
            Http.request.post("/register"),
            Http.request.prependUrl(config.shardManagerUri),
            Http.request.schemaBody(ShardManagerProtocolHttp.Register_)({
              pod: Pod.make(podAddress, config.serverVersion)
            })
          )

          return yield* _(client(request))
        }).pipe(Effect.asVoid, Effect.scoped, Effect.orDie),
      unregister: (podAddress) =>
        Effect.gen(function*(_) {
          const request = yield* _(
            Http.request.post("/unregister"),
            Http.request.prependUrl(config.shardManagerUri),
            Http.request.schemaBody(ShardManagerProtocolHttp.Unregister_)({
              pod: Pod.make(podAddress, config.serverVersion)
            })
          )

          return yield* _(client(request))
        }).pipe(Effect.asVoid, Effect.scoped, Effect.orDie),
      notifyUnhealthyPod: (podAddress) =>
        Effect.gen(function*(_) {
          const request = yield* _(
            Http.request.post("/notify-unhealthy-pod"),
            Http.request.prependUrl(config.shardManagerUri),
            Http.request.schemaBody(ShardManagerProtocolHttp.NotifyUnhealthyPod_)({
              podAddress
            })
          )

          return yield* _(client(request))
        }).pipe(Effect.asVoid, Effect.scoped, Effect.orDie),
      getAssignments: Effect.gen(function*(_) {
        const request = pipe(
          Http.request.get("/get-assignments"),
          Http.request.prependUrl(config.shardManagerUri)
        )

        const response = yield* _(
          client(request),
          Effect.flatMap(
            Http.response.schemaBodyJson(ShardManagerProtocolHttp.GetAssignmentsResult_)
          )
        )

        return HashMap.fromIterable(response)
      }).pipe(Effect.scoped, Effect.orDie)
    })
  })
).pipe(Layer.provide(Http.client.layer))
