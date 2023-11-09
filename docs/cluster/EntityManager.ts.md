---
title: EntityManager.ts
nav_order: 2
parent: "@effect/cluster"
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
  options: RecipientBehaviour.EntityBehaviourOptions = {}
)
```

Added in v1.0.0

# models

## EntityManager (interface)

**Signature**

```ts
export interface EntityManager<Req> {
  readonly recipientType: RecipientType.RecipientType<Req>
  readonly send: <A extends Req>(
    entityId: string,
    req: A,
    replyId: Option.Option<ReplyId.ReplyId>
  ) => Effect.Effect<
    never,
    | ShardingError.ShardingErrorEntityNotManagedByThisPod
    | ShardingError.ShardingErrorPodUnavailable
    | ShardingError.ShardingErrorMessageQueue,
    Option.Option<Message.Success<A>>
  >
  readonly terminateEntitiesOnShards: (shards: HashSet.HashSet<ShardId.ShardId>) => Effect.Effect<never, never, void>
  readonly terminateAllEntities: Effect.Effect<never, never, void>
}
```

Added in v1.0.0
