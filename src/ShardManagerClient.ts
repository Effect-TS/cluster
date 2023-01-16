import * as Effect from "@effect/io/Effect";
import { pipe } from "@fp-ts/data/Function";
import * as HashMap from "@fp-ts/data/HashMap";
import * as Option from "@fp-ts/data/Option";
import { Config } from "./Config";
import * as PodAddress from "./PodAddress";

export interface ShardManagerClient {
  register(podAddress: PodAddress.PodAddress): Effect.Effect<never, never, void>;
  unregister(podAddress: PodAddress.PodAddress): Effect.Effect<never, never, void>;
  notifyUnhealthyPod(podAddress: PodAddress.PodAddress): Effect.Effect<never, never, void>;
  getAssignments: Effect.Effect<
    never,
    never,
    HashMap.HashMap<number, Option.Option<PodAddress.PodAddress>>
  >;
}

export const local = Effect.gen(function* ($) {
  const config = yield* $(Effect.service(Config));
  const pod = PodAddress.podAddress(config.selfHost, config.shardingPort);
  let shards = HashMap.empty<number, Option.Option<PodAddress.PodAddress>>();
  for (let i = 0; i < config.numberOfShards; i++) {
    shards = pipe(shards, HashMap.set(i, Option.some(pod)));
  }
  return {
    register: () => Effect.unit(),
    unregister: () => Effect.unit(),
    notifyUnhealthyPod: () => Effect.unit(),
    getAssignments: Effect.succeed(shards),
  } as ShardManagerClient;
});
