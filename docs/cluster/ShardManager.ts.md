---
title: ShardManager.ts
nav_order: 34
parent: "@effect/cluster"
---

## ShardManager overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [context](#context)
  - [ShardManager](#shardmanager)
- [layers](#layers)
  - [live](#live)
- [models](#models)
  - [ShardManager (interface)](#shardmanager-interface)
- [symbols](#symbols)
  - [ShardManagerTypeId](#shardmanagertypeid)
  - [ShardManagerTypeId (type alias)](#shardmanagertypeid-type-alias)

---

# context

## ShardManager

**Signature**

```ts
export declare const ShardManager: Tag<ShardManager, ShardManager>
```

Added in v1.0.0

# layers

## live

**Signature**

```ts
export declare const live: Layer<Storage | Pods | ManagerConfig | PodsHealth, never, ShardManager>
```

Added in v1.0.0

# models

## ShardManager (interface)

**Signature**

```ts
export interface ShardManager {
  readonly getShardingEvents: Stream.Stream<never, never, ShardingEvent.ShardingEvent>
  readonly register: (pod: Pod.Pod) => Effect.Effect<never, never, void>
  readonly unregister: (podAddress: PodAddress.PodAddress) => Effect.Effect<never, never, void>
  readonly notifyUnhealthyPod: (podAddress: PodAddress.PodAddress) => Effect.Effect<never, never, void>
  readonly checkAllPodsHealth: Effect.Effect<never, never, void>
  readonly getAssignments: Effect.Effect<
    never,
    never,
    HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
  >
  /* @internal */
  readonly rebalance: (rebalanceImmediately: boolean) => Effect.Effect<never, never, void>
  /* @internal */
  readonly persistPods: Effect.Effect<never, never, void>
}
```

Added in v1.0.0

# symbols

## ShardManagerTypeId

**Signature**

```ts
export declare const ShardManagerTypeId: typeof ShardManagerTypeId
```

Added in v1.0.0

## ShardManagerTypeId (type alias)

**Signature**

```ts
export type ShardManagerTypeId = typeof ShardManagerTypeId
```

Added in v1.0.0
