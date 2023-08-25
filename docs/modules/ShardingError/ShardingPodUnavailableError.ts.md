---
title: ShardingError/ShardingPodUnavailableError.ts
nav_order: 32
parent: Modules
---

## ShardingPodUnavailableError overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [ShardingPodUnavailableError](#shardingpodunavailableerror)
- [models](#models)
  - [ShardingPodUnavailableError (interface)](#shardingpodunavailableerror-interface)
- [schema](#schema)
  - [ShardingPodUnavailableErrorSchema](#shardingpodunavailableerrorschema)
- [symbols](#symbols)
  - [ShardingPodUnavailableErrorTag](#shardingpodunavailableerrortag)
- [utils](#utils)
  - [isShardingPodUnavailableError](#isshardingpodunavailableerror)

---

# constructors

## ShardingPodUnavailableError

**Signature**

```ts
export declare function ShardingPodUnavailableError(pod: PodAddress.PodAddress): ShardingPodUnavailableError
```

Added in v1.0.0

# models

## ShardingPodUnavailableError (interface)

**Signature**

```ts
export interface ShardingPodUnavailableError extends Schema.To<typeof ShardingPodUnavailableErrorSchema_> {}
```

Added in v1.0.0

# schema

## ShardingPodUnavailableErrorSchema

**Signature**

```ts
export declare const ShardingPodUnavailableErrorSchema: Schema.Schema<
  {
    readonly _tag: '@effect/sharding/ShardingPodUnavailableError'
    readonly pod: { readonly _id: '@effect/sharding/PodAddress'; readonly host: string; readonly port: number }
  },
  ShardingPodUnavailableError
>
```

Added in v1.0.0

# symbols

## ShardingPodUnavailableErrorTag

**Signature**

```ts
export declare const ShardingPodUnavailableErrorTag: '@effect/sharding/ShardingPodUnavailableError'
```

Added in v1.0.0

# utils

## isShardingPodUnavailableError

**Signature**

```ts
export declare function isShardingPodUnavailableError(value: any): value is ShardingPodUnavailableError
```

Added in v1.0.0
