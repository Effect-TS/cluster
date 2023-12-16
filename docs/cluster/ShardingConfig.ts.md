---
title: ShardingConfig.ts
nav_order: 21
parent: "@effect/cluster"
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
  - [ShardingConfigTypeId](#shardingconfigtypeid)
  - [ShardingConfigTypeId (type alias)](#shardingconfigtypeid-type-alias)

---

# context

## ShardingConfig

**Signature**

```ts
export declare const ShardingConfig: Context.Tag<ShardingConfig, ShardingConfig>
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
export declare const withDefaults: (customs: Partial<ShardingConfig>) => Layer.Layer<never, never, ShardingConfig>
```

Added in v1.0.0

# models

## ShardingConfig (interface)

Sharding configuration

**Signature**

```ts
export interface ShardingConfig {
  readonly numberOfShards: number
  readonly selfHost: string
  readonly shardingPort: number
  readonly shardManagerUri: string
  readonly serverVersion: string
  readonly entityMaxIdleTime: Duration.Duration
  readonly entityTerminationTimeout: Duration.Duration
  readonly sendTimeout: Duration.Duration
  readonly refreshAssignmentsRetryInterval: Duration.Duration
  readonly unhealthyPodReportInterval: Duration.Duration
}
```

Added in v1.0.0

# symbols

## ShardingConfigTypeId

**Signature**

```ts
export declare const ShardingConfigTypeId: typeof ShardingConfigTypeId
```

Added in v1.0.0

## ShardingConfigTypeId (type alias)

**Signature**

```ts
export type ShardingConfigTypeId = typeof ShardingConfigTypeId
```

Added in v1.0.0
