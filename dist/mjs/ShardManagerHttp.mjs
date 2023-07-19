/**
 * @since 1.0.0
 */

import * as Effect from "@effect/io/Effect";
import * as ManagerConfig from "@effect/shardcake/ManagerConfig";
import * as ShardManager from "@effect/shardcake/ShardManager";
import * as ShardManagerProtocolHttp from "@effect/shardcake/ShardManagerProtocolHttp";
import { asHttpServer } from "./node";
/**
 * @since 1.0.0
 * @category layers
 */
export const shardManagerHttp = fa => Effect.flatMap(shardManager => Effect.flatMap(managerConfig => asHttpServer(managerConfig.apiPort, ShardManagerProtocolHttp.schema, (req, reply) => {
  switch (req._tag) {
    case "Register":
      return reply(ShardManagerProtocolHttp.RegisterResult_)(Effect.as(shardManager.register(req.pod), true));
    case "Unregister":
      return reply(ShardManagerProtocolHttp.UnregisterResult_)(Effect.as(shardManager.unregister(req.pod.address), true));
    case "NotifyUnhealthyPod":
      return reply(ShardManagerProtocolHttp.NotifyUnhealthyPodResult_)(Effect.as(shardManager.notifyUnhealthyPod(req.podAddress), true));
    case "GetAssignments":
      return reply(ShardManagerProtocolHttp.GetAssignmentsResult_)(Effect.map(shardManager.getAssignments, _ => Array.from(_)));
  }
})(fa))(ManagerConfig.ManagerConfig))(ShardManager.ShardManager);
//# sourceMappingURL=ShardManagerHttp.mjs.map