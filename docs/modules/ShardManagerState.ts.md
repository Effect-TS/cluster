---
title: ShardManagerState.ts
nav_order: 35
parent: Modules
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
  pods: HashMap.HashMap<PodAddress.PodAddress, PodWithMetadata.PodWithMetadata>
  shards: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
  unassignedShards: HashSet.HashSet<ShardId.ShardId>
  averageShardsPerPod: ShardId.ShardId
  shardsPerPod: HashMap.HashMap<PodAddress.PodAddress, HashSet.HashSet<ShardId.ShardId>>
  maxVersion: Option.Option<List.List<number>>
  allPodsHaveMaxVersion: boolean
}
```

Added in v1.0.0
