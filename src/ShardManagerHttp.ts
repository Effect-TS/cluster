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
import * as ShardManagerProtocolHttp from "./ShardManagerProtocolHttp";
import * as ShardId from "./ShardId";

export const shardManagerHttp = <R, E, B>(fa: Effect.Effect<R, E, B>) =>
  pipe(
    ShardManager.ShardManager,
    Effect.flatMap((shardManager) =>
      pipe(
        ManagerConfig.ManagerConfig,
        Effect.flatMap((managerConfig) =>
          pipe(
            fa,
            asHttpServer(managerConfig.apiPort, ShardManagerProtocolHttp.schema, (req, reply) => {
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
                case "GetAssignments":
                  return Effect.flatMap(shardManager.getAssignments, (assignments) =>
                    reply(ShardManagerProtocolHttp.GetAssignments_Reply, Array.from(assignments))
                  );
              }
            })
          )
        )
      )
    )
  );
