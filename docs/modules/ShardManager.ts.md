---
title: ShardManager.ts
nav_order: 32
parent: Modules
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
export declare const live: Layer.Layer<unknown, unknown, ShardManager>
```

Added in v1.0.0

# models

## ShardManager (interface)

**Signature**

```ts
export interface ShardManager {
  getShardingEvents: Stream.Stream<never, never, ShardingEvent.ShardingEvent>
  register(pod: Pod.Pod): Effect.Effect<never, never, void>
  unregister(podAddress: PodAddress.PodAddress): Effect.Effect<never, never, void>
  notifyUnhealthyPod: (podAddress: PodAddress.PodAddress) => Effect.Effect<never, never, void>
  checkAllPodsHealth: Effect.Effect<never, never, void>
  /* @internal */
  rebalance(rebalanceImmediately: boolean): Effect.Effect<never, never, void>
  /* @internal */
  getAssignments: Effect.Effect<never, never, HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>>
  /* @internal */
  persistPods: Effect.Effect<never, never, void>
}
```

Added in v1.0.0
