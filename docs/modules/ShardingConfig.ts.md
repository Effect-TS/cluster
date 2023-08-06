---
title: ShardingConfig.ts
nav_order: 26
parent: Modules
---

## ShardingConfig overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [context](#context)
  - [ShardingConfig](#shardingconfig)
- [layers](#layers)
  - [defaults](#defaults)
  - [withDefaults](#withdefaults)
- [models](#models)
  - [ShardingConfig (interface)](#shardingconfig-interface)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)

---

# context

## ShardingConfig

**Signature**

```ts
export declare const ShardingConfig: Tag<ShardingConfig, ShardingConfig>
```

Added in v1.0.0

# layers

## defaults

**Signature**

```ts
export declare const defaults: Layer.Layer<never, never, ShardingConfig>
```

Added in v1.0.0

## withDefaults

**Signature**

```ts
export declare function withDefaults(customs: Partial<ShardingConfig>)
```

Added in v1.0.0

# models

## ShardingConfig (interface)

Sharding configuration

**Signature**

```ts
export interface ShardingConfig {
  numberOfShards: number
  selfHost: string
  shardingPort: number
  shardManagerUri: string
  serverVersion: string
  entityMaxIdleTime: Duration.Duration
  entityTerminationTimeout: Duration.Duration
  sendTimeout: Duration.Duration
  refreshAssignmentsRetryInterval: Duration.Duration
  unhealthyPodReportInterval: Duration.Duration
  simulateRemotePods: boolean
}
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: typeof TypeId
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0
