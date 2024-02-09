/**
 * @since 1.0.0
 */
import * as Sharding from "@effect/cluster/Sharding"
import * as ShardingConfig from "@effect/cluster/ShardingConfig"
import * as NodeHttpServer from "@effect/platform-node/NodeHttpServer"
import * as Http from "@effect/platform/HttpServer"
import * as Effect from "effect/Effect"
import * as Either from "effect/Either"
import * as HashSet from "effect/HashSet"
import * as Layer from "effect/Layer"
import { createServer } from "node:http"
import * as ShardingProtocolHttp from "./ShardingProtocolHttp.js"

const internalServer = Layer.unwrapEffect(Effect.gen(function*(_) {
  const config = yield* _(ShardingConfig.ShardingConfig)

  return NodeHttpServer.server.layer(() => createServer(), { port: config.shardingPort })
}))

/**
 * @since 1.0.0
 * @category layers
 */
export const shardingServiceHttp: Layer.Layer<
  never,
  Http.error.ServeError,
  ShardingConfig.ShardingConfig | Sharding.Sharding
> = Http.router.empty.pipe(
  Http.router.post(
    "/assign-shards",
    Effect.gen(function*(_) {
      const sharding = yield* _(Sharding.Tag)
      const body = yield* _(Http.request.schemaBodyJson(ShardingProtocolHttp.AssignShard_))
      yield* _(sharding.assign(HashSet.fromIterable(body.shards)))
      return yield* _(Http.response.json(true))
    })
  ),
  Http.router.post(
    "/unassign-shards",
    Effect.gen(function*(_) {
      const sharding = yield* _(Sharding.Tag)
      const body = yield* _(Http.request.schemaBodyJson(ShardingProtocolHttp.UnassignShards_))
      yield* _(sharding.unassign(HashSet.fromIterable(body.shards)))
      return yield* _(Http.response.json(true))
    })
  ),
  Http.router.get(
    "/ping",
    Effect.gen(function*(_) {
      return yield* _(Http.response.json(true))
    })
  ),
  Http.router.post(
    "/send-message",
    Effect.gen(function*(_) {
      const sharding = yield* _(Sharding.Tag)
      const body = yield* _(Http.request.schemaBodyJson(ShardingProtocolHttp.Send_))
      const result = yield* _(
        sharding.sendMessageToLocalEntityManagerWithoutRetries(body.message),
        Effect.match({
          onFailure: Either.left,
          onSuccess: Either.right
        })
      )
      return yield* _(Http.response.schemaJson(ShardingProtocolHttp.SendResult_)(result))
    })
  ),
  Http.server.serve(Http.middleware.logger)
).pipe(Layer.provide(internalServer))
