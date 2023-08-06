---
title: ManagerConfig.ts
nav_order: 7
parent: Modules
---

## ManagerConfig overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [context](#context)
  - [ManagerConfig](#managerconfig)
- [models](#models)
  - [ManagerConfig (interface)](#managerconfig-interface)
- [utils](#utils)
  - [defaults](#defaults)

---

# context

## ManagerConfig

**Signature**

```ts
export declare const ManagerConfig: Tag<ManagerConfig, ManagerConfig>
```

Added in v1.0.0

# models

## ManagerConfig (interface)

Shard Manager configuration

**Signature**

```ts
export interface ManagerConfig {
  numberOfShards: number
  apiPort: number
  rebalanceInterval: Duration.Duration
  rebalanceRetryInterval: Duration.Duration
  pingTimeout: Duration.Duration
  persistRetryInterval: Duration.Duration
  persistRetryCount: number
  rebalanceRate: number
}
```

Added in v1.0.0

# utils

## defaults

**Signature**

```ts
export declare const defaults: Layer.Layer<never, never, ManagerConfig>
```

Added in v1.0.0
