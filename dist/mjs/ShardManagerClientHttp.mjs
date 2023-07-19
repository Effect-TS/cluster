/**
 * @since 1.0.0
 */

import * as HashMap from "@effect/data/HashMap";
import * as Effect from "@effect/io/Effect";
import * as Layer from "@effect/io/Layer";
import * as Pod from "@effect/shardcake/Pod";
import * as ShardingConfig from "@effect/shardcake/ShardingConfig";
import * as ShardManagerClient from "@effect/shardcake/ShardManagerClient";
import * as ShardManagerProtocolHttp from "@effect/shardcake/ShardManagerProtocolHttp";
import { send } from "./utils";
/**
 * @since 1.0.0
 * @category layers
 */
export const shardManagerClientHttp = /*#__PURE__*/Layer.effect(ShardManagerClient.ShardManagerClient, /*#__PURE__*/Effect.map(config => ({
  register: podAddress => send(ShardManagerProtocolHttp.Register_, ShardManagerProtocolHttp.RegisterResult_)(config.shardManagerUri, {
    _tag: "Register",
    pod: Pod.make(podAddress, config.serverVersion)
  }),
  unregister: podAddress => send(ShardManagerProtocolHttp.Unregister_, ShardManagerProtocolHttp.UnregisterResult_)(config.shardManagerUri, {
    _tag: "Unregister",
    pod: Pod.make(podAddress, config.serverVersion)
  }),
  notifyUnhealthyPod: podAddress => send(ShardManagerProtocolHttp.NotifyUnhealthyPod_, ShardManagerProtocolHttp.NotifyUnhealthyPodResult_)(config.shardManagerUri, {
    _tag: "NotifyUnhealthyPod",
    podAddress
  }),
  getAssignments: Effect.map(data => HashMap.fromIterable(data))(send(ShardManagerProtocolHttp.GetAssignments_, ShardManagerProtocolHttp.GetAssignmentsResult_)(config.shardManagerUri, {
    _tag: "GetAssignments"
  }))
}))(ShardingConfig.ShardingConfig));
//# sourceMappingURL=ShardManagerClientHttp.mjs.map