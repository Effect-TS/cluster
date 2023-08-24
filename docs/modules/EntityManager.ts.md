---
title: EntityManager.ts
nav_order: 4
parent: Modules
---

## EntityManager overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [models](#models)
  - [EntityManager (interface)](#entitymanager-interface)

---

# constructors

## make

**Signature**

```ts
export declare function make<R, Req>(
  recipientType: RecipientType.RecipientType<Req>,
  behaviour_: RecipientBehaviour.RecipientBehaviour<R, Req>,
  sharding: Sharding.Sharding,
  config: ShardingConfig.ShardingConfig,
  options: RecipientBehaviour.EntityBehaviourOptions<R, Req> = {}
)
```

Added in v1.0.0

# models

## EntityManager (interface)

**Signature**

```ts
export interface EntityManager<Req> {
  readonly send: (
    entityId: string,
    req: Req,
    replyId: Option.Option<ReplyId.ReplyId>,
    replyChannel: ReplyChannel.ReplyChannel<any>
  ) => Effect.Effect<never, ShardError.EntityNotManagedByThisPod, void>
  readonly terminateEntitiesOnShards: (shards: HashSet.HashSet<ShardId.ShardId>) => Effect.Effect<never, never, void>
  readonly terminateAllEntities: Effect.Effect<never, never, void>
}
```

Added in v1.0.0
