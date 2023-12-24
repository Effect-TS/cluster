---
title: ManagerConfig.ts
nav_order: 5
parent: "@effect/cluster"
---

## ManagerConfig overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [context](#context)
  - [ManagerConfig](#managerconfig)
- [models](#models)
  - [ManagerConfig (interface)](#managerconfig-interface)
- [symbols](#symbols)
  - [ManagerConfigTypeId](#managerconfigtypeid)
  - [ManagerConfigTypeId (type alias)](#managerconfigtypeid-type-alias)
- [utils](#utils)
  - [defaults](#defaults)

---

# context

## ManagerConfig

**Signature**

```ts
export declare const ManagerConfig: Context.Tag<ManagerConfig, ManagerConfig>
```

Added in v1.0.0

# models

## ManagerConfig (interface)

Shard Manager configuration

**Signature**

```ts
export interface ManagerConfig {
  readonly [ManagerConfigTypeId]: ManagerConfigTypeId
  readonly numberOfShards: number
  readonly apiPort: number
  readonly rebalanceInterval: Duration.Duration
  readonly rebalanceRetryInterval: Duration.Duration
  readonly pingTimeout: Duration.Duration
  readonly persistRetryInterval: Duration.Duration
  readonly persistRetryCount: number
  readonly rebalanceRate: number
}
```

Added in v1.0.0

# symbols

## ManagerConfigTypeId

**Signature**

```ts
export declare const ManagerConfigTypeId: typeof ManagerConfigTypeId
```

Added in v1.0.0

## ManagerConfigTypeId (type alias)

**Signature**

```ts
export type ManagerConfigTypeId = typeof ManagerConfigTypeId
```

Added in v1.0.0

# utils

## defaults

**Signature**

```ts
export declare const defaults: Layer.Layer<never, never, ManagerConfig>
```

Added in v1.0.0
