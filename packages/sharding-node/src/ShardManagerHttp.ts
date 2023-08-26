/**
 * @since 1.0.0
 */
import * as Effect from "@effect/io/Effect"
import * as Layer from "@effect/io/Layer"
import * as Http from "@effect/platform-node/HttpServer"
import * as ShardManagerProtocolHttp from "@effect/sharding-node/ShardManagerProtocolHttp"
import * as ManagerConfig from "@effect/sharding/ManagerConfig"
import * as ShardManager from "@effect/sharding/ShardManager"
import { createServer } from "node:http"

const internalServer = Layer.unwrapEffect(Effect.gen(function*(_) {
  const managerConfig = yield* _(ManagerConfig.ManagerConfig)

  return Http.server.layer(() => createServer(), { port: managerConfig.apiPort })
}))

export const shardManagerHttp = Layer.scopedDiscard(
  Effect.gen(function*(_) {
    const shardManager = yield* _(ShardManager.ShardManager)

    return yield* _(Http.router.empty.pipe(
      Http.router.post(
        "/register",
        Effect.gen(function*(_) {
          const body = yield* _(Http.request.schemaBodyJson(ShardManagerProtocolHttp.Register_))
          yield* _(shardManager.register(body.pod))
          return yield* _(Http.response.json(true))
        })
      ),
      Http.router.post(
        "/unregister",
        Effect.gen(function*(_) {
          const body = yield* _(Http.request.schemaBodyJson(ShardManagerProtocolHttp.Unregister_))
          yield* _(shardManager.unregister(body.pod.address))
          return yield* _(Http.response.json(true))
        })
      ),
      Http.router.post(
        "/notify-unhealthy-pod",
        Effect.gen(function*(_) {
          const body = yield* _(Http.request.schemaBodyJson(ShardManagerProtocolHttp.NotifyUnhealthyPod_))
          yield* _(shardManager.notifyUnhealthyPod(body.podAddress))
          return yield* _(Http.response.json(true))
        })
      ),
      Http.router.get(
        "/get-assignments",
        Effect.gen(function*(_) {
          const assignments = yield* _(shardManager.getAssignments)
          return yield* _(
            Http.response.schemaJson(ShardManagerProtocolHttp.GetAssignmentsResult_)(Array.from(assignments))
          )
        })
      ),
      Http.router.prefixAll("/api/rest"),
      Http.server.serve(Http.middleware.logger)
    ))
  })
).pipe(Layer.use(internalServer))
