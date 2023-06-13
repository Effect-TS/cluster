import * as Pods from "./Pods";
import * as PodAddress from "./PodAddress";
import * as Layer from "@effect/io/Layer";
import * as Schema from "@effect/schema/Schema";
import * as Effect from "@effect/io/Effect";
import { SendError } from "./ShardError";
import * as ShardingProtocolHttp from "./ShardingProtocolHttp";
import { pipe } from "@effect/data/Function";
import * as HashSet from "@effect/data/HashSet";
import * as ByteArray from "./ByteArray";
import { send } from "./utils";

function asHttpUrl(pod: PodAddress.PodAddress): string {
  return `http://${pod.host}:${pod.port}/`;
}

export const httpPods = Layer.succeed(Pods.Pods, {
  [Pods.PodsTypeId]: {},
  assignShards: (pod, shards) =>
    send(ShardingProtocolHttp.AssignShard_, Schema.boolean)(asHttpUrl(pod), {
      _tag: "AssignShards",
      shards: Array.from(shards),
    }),
  unassignShards: (pod, shards) =>
    send(ShardingProtocolHttp.UnassignShards_, Schema.boolean)(asHttpUrl(pod), {
      _tag: "UnassignShards",
      shards: Array.from(shards),
    }),
  ping: (pod) =>
    send(ShardingProtocolHttp.PingShards_, Schema.boolean)(asHttpUrl(pod), { _tag: "PingShards" }),
  sendMessage: (pod, message) =>
    send(ShardingProtocolHttp.Send_, Schema.option(ByteArray.schema))(asHttpUrl(pod), {
      _tag: "Send",
      message,
    }),
});
