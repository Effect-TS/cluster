---
title: ShardManagerState.ts
nav_order: 39
parent: "@effect/cluster"
---

## ShardManagerState overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [models](#models)
  - [ShardManagerState (interface)](#shardmanagerstate-interface)

---

# constructors

## make

**Signature**

```ts
export declare function make(
  pods: HashMap.HashMap<PodAddress.PodAddress, PodWithMetadata.PodWithMetadata>,
  shards: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
): ShardManagerState
```

Added in v1.0.0

# models

## ShardManagerState (interface)

**Signature**

```ts
export interface ShardManagerState {
  readonly pods: HashMap.HashMap<PodAddress.PodAddress, PodWithMetadata.PodWithMetadata>
  readonly shards: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
  readonly unassignedShards: HashSet.HashSet<ShardId.ShardId>
  readonly averageShardsPerPod: ShardId.ShardId
  readonly shardsPerPod: HashMap.HashMap<PodAddress.PodAddress, HashSet.HashSet<ShardId.ShardId>>
  readonly maxVersion: Option.Option<List.List<number>>
  readonly allPodsHaveMaxVersion: boolean
}
```

Added in v1.0.0
