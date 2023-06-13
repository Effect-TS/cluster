import * as ShardManagerClient from "./ShardManagerClient";
import * as Pod from "./Pod";
import * as PodAddress from "./PodAddress";
import * as Layer from "@effect/io/Layer";
import * as Schema from "@effect/schema/Schema";
import * as Effect from "@effect/io/Effect";
import { SendError } from "./ShardError";
import * as ShardManagerProtocolHttp from "./ShardManagerProtocolHttp";
import { pipe } from "@effect/data/Function";
import * as HashMap from "@effect/data/HashMap";
import * as ByteArray from "./ByteArray";
import { send } from "./utils";
import * as Config from "./Config";

export const shardManagerClientHttp = Layer.effect(
  ShardManagerClient.ShardManagerClient,
  pipe(
    Config.Config,
    Effect.map(
      (config) =>
        ({
          register: (podAddress) =>
            send(ShardManagerProtocolHttp.Register_, Schema.boolean)(config.shardManagerUri, {
              _tag: "Register",
              pod: Pod.pod(podAddress, config.serverVersion),
            }),
          unregister: (podAddress) =>
            send(ShardManagerProtocolHttp.Unregister_, Schema.boolean)(config.shardManagerUri, {
              _tag: "Unregister",
              pod: Pod.pod(podAddress, config.serverVersion),
            }),
          notifyUnhealthyPod: (podAddress) =>
            send(ShardManagerProtocolHttp.NotifyUnhealthyPod_, Schema.boolean)(
              config.shardManagerUri,
              {
                _tag: "NotifyUnhealthyPod",
                podAddress,
              }
            ),
          getAssignments: pipe(
            send(
              ShardManagerProtocolHttp.GetAssignments_,
              ShardManagerProtocolHttp.GetAssignments_Reply
            )(config.shardManagerUri, {
              _tag: "GetAssignments",
            }),
            Effect.map((data) => HashMap.fromIterable(data))
          ),
        } as ShardManagerClient.ShardManagerClient)
    )
  )
);
