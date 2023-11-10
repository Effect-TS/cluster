---
title: ShardingImpl.ts
nav_order: 34
parent: "@effect/cluster"
---

## ShardingImpl overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [layers](#layers)
  - [live](#live)

---

# layers

## live

**Signature**

```ts
export declare const live: Layer.Layer<
  | Storage.Storage
  | ShardingConfig.ShardingConfig
  | Pods.Pods
  | ShardManagerClient.ShardManagerClient
  | Serialization.Serialization,
  never,
  Sharding.Sharding
>
```

Added in v1.0.0
