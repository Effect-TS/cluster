import * as Sharding from "./Sharding";
import * as Queue from "@effect/io/Queue";
import * as Deferred from "@effect/io/Deferred";
import * as Config from "./Config";
import * as Effect from "@effect/io/Effect";
import * as HashSet from "@effect/data/HashSet";
import { pipe } from "@effect/data/Function";
import * as Option from "@effect/data/Option";
import * as http from "http";
import { asHttpServer } from "./node";
import * as Schema from "@effect/schema/Schema";
import * as Pod from "./Pod";
import * as PodAddress from "./PodAddress";
import * as ShardId from "./ShardId";
import * as BinaryMessage from "./BinaryMessage";
import * as ByteArray from "./ByteArray";
import * as ShardingProtocolHttp from "./ShardingProtocolHttp";

export const shardingServiceHttp = <R, E, B>(fa: Effect.Effect<R, E, B>) =>
  pipe(
    Sharding.Sharding,
    Effect.flatMap((sharding) =>
      pipe(
        Config.Config,
        Effect.flatMap((config) =>
          pipe(
            fa,
            asHttpServer(config.shardingPort, ShardingProtocolHttp.schema, (req, reply) => {
              switch (req._tag) {
                case "AssignShards":
                  return Effect.zipRight(
                    sharding.assign(HashSet.fromIterable(req.shards)),
                    reply(Schema.boolean, true)
                  );
                case "UnassignShards":
                  return Effect.zipRight(
                    sharding.unassign(HashSet.fromIterable(req.shards)),
                    reply(Schema.boolean, true)
                  );
                case "Send":
                  return pipe(
                    sharding.sendToLocalEntity(req.message),
                    Effect.flatMap((res) => reply(Schema.option(ByteArray.schema), res)),
                    Effect.catchAll((error) =>
                      reply(Schema.option(ByteArray.schema), Option.none())
                    )
                  );
                case "PingShards":
                  return reply(Schema.boolean, true);
              }
              return Effect.die("Unhandled");
            })
          )
        )
      )
    )
  );
