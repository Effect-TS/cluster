---
title: Sharding.ts
nav_order: 22
parent: Modules
---

## Sharding overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [context](#context)
  - [Sharding](#sharding)
- [models](#models)
  - [Sharding (interface)](#sharding-interface)

---

# context

## Sharding

**Signature**

```ts
export declare const Sharding: Tag<Sharding, Sharding>
```

Added in v1.0.0

# models

## Sharding (interface)

**Signature**

```ts
export interface Sharding {
  getShardId: (recipientType: RecipentType.RecipientType<any>, entityId: string) => ShardId.ShardId
  register: Effect.Effect<never, Throwable, void>
  unregister: Effect.Effect<never, Throwable, void>
  reply<Reply>(reply: Reply, replier: Replier<Reply>): Effect.Effect<never, never, void>
  messenger<Msg>(
    entityType: RecipentType.RecipientType<Msg>,
    sendTimeout?: Option.Option<Duration.Duration>
  ): Messenger<Msg>
  isEntityOnLocalShards(
    recipientType: RecipentType.RecipientType<any>,
    entityId: string
  ): Effect.Effect<never, never, boolean>
  isShuttingDown: Effect.Effect<never, never, boolean>
  initReply(
    id: ReplyId.ReplyId,
    promise: Deferred.Deferred<Throwable, Option.Option<any>>
  ): Effect.Effect<never, never, void>
  registerScoped: Effect.Effect<Scope, Throwable, void>
  registerEntity<Req, R>(
    entityType: RecipentType.RecipientType<Req>,
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
```

Added in v1.0.0
