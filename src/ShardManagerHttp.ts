import * as Queue from "@effect/io/Queue";
import * as Deferred from "@effect/io/Deferred";
import * as ShardManager from "./ShardManager";
import * as ManagerConfig from "./ManagerConfig";
import * as Effect from "@effect/io/Effect";
import { pipe } from "@effect/data/Function";
import * as http from "http";
import { asHttpServer } from "./node";
import * as Schema from "@effect/schema/Schema";
import * as Pod from "./Pod";
import * as PodAddress from "./PodAddress";

const RequestSchema = Schema.union(
  Schema.struct({
    _tag: Schema.literal("Register"),
    pod: Pod.Schema_,
  }),
  Schema.struct({
    _tag: Schema.literal("Unregister"),
    pod: Pod.Schema_,
  }),
  Schema.struct({
    _tag: Schema.literal("NotifyUnhealthyPod"),
    podAddress: PodAddress.Schema_,
  }),
  Schema.struct({
    _tag: Schema.literal("CheckAllPodsHealth"),
  })
);

export const shardManagerHttp = <R, E, B>(fa: Effect.Effect<R, E, B>) =>
  pipe(
    ShardManager.ShardManager,
    Effect.flatMap((shardManager) =>
      pipe(
        ManagerConfig.ManagerConfig,
        Effect.flatMap((managerConfig) =>
          pipe(
            fa,
            asHttpServer(managerConfig.apiPort, RequestSchema, (req, reply) => {
              switch (req._tag) {
                case "Register":
                  return Effect.zipRight(
                    shardManager.register(req.pod),
                    reply(Schema.boolean, true)
                  );
                case "Unregister":
                  return Effect.zipRight(
                    shardManager.unregister(req.pod.address),
                    reply(Schema.boolean, true)
                  );
                case "NotifyUnhealthyPod":
                  return Effect.zipRight(
                    shardManager.notifyUnhealthyPod(req.podAddress),
                    reply(Schema.boolean, true)
                  );
                case "CheckAllPodsHealth":
                  return Effect.zipRight(
                    shardManager.checkAllPodsHealth,
                    reply(Schema.boolean, true)
                  );
              }
            })
          )
        )
      )
    )
  );
