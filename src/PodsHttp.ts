import * as Pods from "./Pods";
import * as PodAddress from "./PodAddress";
import * as Layer from "@effect/io/Layer";
import * as Schema from "@effect/schema/Schema";
import * as Effect from "@effect/io/Effect";
import { PodUnavailable, SendError, isFetchError, FetchError } from "./ShardError";
import * as ShardingProtocolHttp from "./ShardingProtocolHttp";
import { pipe } from "@effect/data/Function";
import * as HashSet from "@effect/data/HashSet";
import * as ByteArray from "./ByteArray";
import { send } from "./utils";
import * as Option from "@effect/data/Option";

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
    pipe(
      send(ShardingProtocolHttp.UnassignShards_, Schema.boolean)(asHttpUrl(pod), {
        _tag: "UnassignShards",
        shards: Array.from(shards),
      }),
      Effect.orDie
    ),
  ping: (pod) =>
    pipe(
      send(ShardingProtocolHttp.PingShards_, Schema.boolean)(asHttpUrl(pod), {
        _tag: "PingShards",
      }),
      Effect.catchSome((e) => {
        if (isFetchError(e)) {
          return Option.some(Effect.fail(PodUnavailable(pod)));
        }
        return Option.none();
      })
    ),
  sendMessage: (pod, message) =>
    send(ShardingProtocolHttp.Send_, Schema.option(ByteArray.schema))(asHttpUrl(pod), {
      _tag: "Send",
      message,
    }),
});
