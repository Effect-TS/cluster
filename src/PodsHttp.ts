import * as Pods from "./Pods";
import * as PodAddress from "./PodAddress";
import * as Layer from "@effect/io/Layer";

function asHttpUrl(pod: PodAddress.PodAddress): string {
  return `http://${pod.host}:${pod.port}/`;
}

export const httpPods = Layer.succeed(Pods.Pods, {
  [Pods.PodsTypeId]: {},
  assignShards: (pod, shards) => send(asHttpUrl(pod)),
});
