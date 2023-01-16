import * as Option from "@fp-ts/data/Option";
import * as Deferred from "@effect/io/Deferred";
import * as Effect from "@effect/io/Effect";
import * as ShardError from "./ShardError";
import * as HashSet from "@fp-ts/data/HashSet";
import { ShardId } from "./ShardId";

export interface EntityManager<Req> {
  send(
    entityId: string,
    req: Req,
    replyId: Option.Option<string>,
    promise: Deferred.Deferred<ShardError.SendError, Option.Option<any>>
  ): Effect.Effect<never, ShardError.EntityNotManagedByThisPod, void>;
  terminateEntitiesOnShards(shards: HashSet.HashSet<ShardId>): Effect.Effect<never, never, void>;
  terminateAllEntities: Effect.Effect<never, never, void>;
}
