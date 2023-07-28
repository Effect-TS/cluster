---
title: ShardingServiceHttp.ts
nav_order: 30
parent: Modules
---

## ShardingServiceHttp overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [layers](#layers)
  - [shardingServiceHttp](#shardingservicehttp)

---

# layers

## shardingServiceHttp

**Signature**

```ts
export declare const shardingServiceHttp: <R, E, B>(
  fa: Effect.Effect<R, E, B>
) => Effect.Effect<Sharding.Sharding | ShardingConfig.ShardingConfig | R, E, B>
```

Added in v1.0.0
