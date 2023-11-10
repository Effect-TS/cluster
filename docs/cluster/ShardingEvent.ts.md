---
title: ShardingEvent.ts
nav_order: 29
parent: "@effect/cluster"
---

## ShardingEvent overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [PodHealthChecked](#podhealthchecked)
  - [PodRegistered](#podregistered)
  - [PodUnregistered](#podunregistered)
  - [ShardsAssigned](#shardsassigned)
  - [ShardsUnassigned](#shardsunassigned)
- [models](#models)
  - [ShardingEvent (type alias)](#shardingevent-type-alias)

---

# constructors

## PodHealthChecked

**Signature**

```ts
export declare function PodHealthChecked(pod: PodAddress.PodAddress): PodHealthChecked
```

Added in v1.0.0

## PodRegistered

**Signature**

```ts
export declare function PodRegistered(pod: PodAddress.PodAddress): PodRegistered
```

Added in v1.0.0

## PodUnregistered

**Signature**

```ts
export declare function PodUnregistered(pod: PodAddress.PodAddress): PodUnregistered
```

Added in v1.0.0

## ShardsAssigned

**Signature**

```ts
export declare function ShardsAssigned(
  pod: PodAddress.PodAddress,
  shards: HashSet.HashSet<ShardId.ShardId>
): ShardsAssigned
```

Added in v1.0.0

## ShardsUnassigned

**Signature**

```ts
export declare function ShardsUnassigned(
  pod: PodAddress.PodAddress,
  shards: HashSet.HashSet<ShardId.ShardId>
): ShardsUnassigned
```

Added in v1.0.0

# models

## ShardingEvent (type alias)

**Signature**

```ts
export type ShardingEvent = ShardsAssigned | ShardsUnassigned | PodHealthChecked | PodRegistered | PodUnregistered
```

Added in v1.0.0
