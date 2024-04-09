---
title: ShardManager.ts
nav_order: 26
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
export declare const live: Layer<ShardManager, never, Storage | Pods | ManagerConfig | PodsHealth>
```

Added in v1.0.0

# models

## ShardManager (interface)

**Signature**

```ts
export interface ShardManager {
  readonly getShardingEvents: Stream.Stream<ShardingEvent.ShardingEvent>
  readonly register: (pod: Pod.Pod) => Effect.Effect<void>
  readonly unregister: (podAddress: PodAddress.PodAddress) => Effect.Effect<void>
  readonly notifyUnhealthyPod: (podAddress: PodAddress.PodAddress) => Effect.Effect<void>
  readonly checkAllPodsHealth: Effect.Effect<void>
  readonly getAssignments: Effect.Effect<HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>>
  /* @internal */
  readonly rebalance: (rebalanceImmediately: boolean) => Effect.Effect<void>
  /* @internal */
  readonly persistPods: Effect.Effect<void>
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
