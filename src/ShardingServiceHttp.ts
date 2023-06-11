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

const RequestSchema = Schema.union(
  Schema.struct({
    _tag: Schema.literal("AssignShards"),
    shards: Schema.array(ShardId.schema),
  }),
  Schema.struct({
    _tag: Schema.literal("UnassignShards"),
    shards: Schema.array(ShardId.schema),
  }),
  Schema.struct({
    _tag: Schema.literal("Send"),
    entityId: Schema.string,
    entityType: Schema.string,
    body: Schema.string,
    replyId: Schema.option(Schema.string),
  }),
  Schema.struct({
    _tag: Schema.literal("PingShards"),
  })
);

export const shardingServiceHttp = <R, E, B>(fa: Effect.Effect<R, E, B>) =>
  pipe(
    Sharding.Sharding,
    Effect.flatMap((sharding) =>
      pipe(
        Config.Config,
        Effect.flatMap((config) =>
          pipe(
            fa,
            asHttpServer(config.shardingPort, RequestSchema, (req, reply) => {
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
                    sharding.sendToLocalEntity(
                      BinaryMessage.apply(req.entityId, req.entityType, req.body, req.replyId)
                    ),
                    Effect.flatMap((res) => reply(Schema.option(Schema.string), res)),
                    Effect.catchAll((error) => reply(Schema.option(Schema.string), Option.none()))
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
