import { Tag } from "@effect/data/Context"
import type * as HashSet from "@effect/data/HashSet"
import type * as Option from "@effect/data/Option"
import type * as Deferred from "@effect/io/Deferred"
import type * as Effect from "@effect/io/Effect"
import type * as Queue from "@effect/io/Queue"
import type * as BinaryMessage from "@effect/shardcake/BinaryMessage"
import type * as ByteArray from "@effect/shardcake/ByteArray"
import type { Replier } from "@effect/shardcake/Replier"
import type * as ReplyId from "@effect/shardcake/ReplyId"
import type { EntityTypeNotRegistered, Throwable } from "@effect/shardcake/ShardError"

import type * as Duration from "@effect/data/Duration"
import type { Scope } from "@effect/io/Scope"
import type { Messenger } from "@effect/shardcake/Messenger"
import type { EntityType, RecipentType } from "@effect/shardcake/RecipientType"
import type * as ShardId from "@effect/shardcake/ShardId"

export interface Sharding {
  getShardId: (recipientType: RecipentType<any>, entityId: string) => ShardId.ShardId
  register: Effect.Effect<never, Throwable, void>
  unregister: Effect.Effect<never, Throwable, void>
  reply<Reply>(reply: Reply, replier: Replier<Reply>): Effect.Effect<never, never, void>
  messenger<Msg>(
    entityType: EntityType<Msg>,
    sendTimeout?: Option.Option<Duration.Duration>
  ): Messenger<Msg>
  isEntityOnLocalShards(
    recipientType: RecipentType<any>,
    entityId: string
  ): Effect.Effect<never, never, boolean>
  isShuttingDown: Effect.Effect<never, never, boolean>
  initReply(
    id: ReplyId.ReplyId,
    promise: Deferred.Deferred<Throwable, Option.Option<any>>
  ): Effect.Effect<never, never, void>
  registerScoped: Effect.Effect<Scope, Throwable, void>
  registerEntity<R, Req>(
    entityType: EntityType<Req>,
    behavior: (entityId: string, dequeue: Queue.Dequeue<Req>) => Effect.Effect<R, never, void>,
    terminateMessage?: (p: Deferred.Deferred<never, void>) => Option.Option<Req>,
    entityMaxIdleTime?: Option.Option<Duration.Duration>
  ): Effect.Effect<Scope | R, never, void>
  refreshAssignments: Effect.Effect<never, never, void>
  assign: (shards: HashSet.HashSet<ShardId.ShardId>) => Effect.Effect<never, never, void>
  unassign: (shards: HashSet.HashSet<ShardId.ShardId>) => Effect.Effect<never, never, void>
  sendToLocalEntity(
    msg: BinaryMessage.BinaryMessage
  ): Effect.Effect<never, EntityTypeNotRegistered, Option.Option<ByteArray.ByteArray>>
}

export const Sharding = Tag<Sharding>()
