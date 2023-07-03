---
title: ShardManagerHttp.ts
nav_order: 32
parent: Modules
---

## ShardManagerHttp overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [layers](#layers)
  - [shardManagerHttp](#shardmanagerhttp)

---

# layers

## shardManagerHttp

**Signature**

```ts
export declare const shardManagerHttp: <R, E, B>(
  fa: Effect.Effect<R, E, B>
) => Effect.Effect<ManagerConfig.ManagerConfig | ShardManager.ShardManager | R, E, B>
```

Added in v1.0.0
