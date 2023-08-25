---
title: ShardingError/ShardingPodNoLongerRegisteredError.ts
nav_order: 31
parent: Modules
---

## ShardingPodNoLongerRegisteredError overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [ShardingPodNoLongerRegisteredError](#shardingpodnolongerregisterederror)
  - [isShardingPodNoLongerRegisteredError](#isshardingpodnolongerregisterederror)
- [models](#models)
  - [ShardingPodNoLongerRegisteredError (interface)](#shardingpodnolongerregisterederror-interface)
- [schema](#schema)
  - [ShardingPodNoLongerRegisteredErrorSchema](#shardingpodnolongerregisterederrorschema)
- [symbols](#symbols)
  - [ShardingPodNoLongerRegisteredErrorTag](#shardingpodnolongerregisterederrortag)

---

# constructors

## ShardingPodNoLongerRegisteredError

**Signature**

```ts
export declare function ShardingPodNoLongerRegisteredError(
  podAddress: PodAddress.PodAddress
): ShardingPodNoLongerRegisteredError
```

Added in v1.0.0

## isShardingPodNoLongerRegisteredError

**Signature**

```ts
export declare function isShardingPodNoLongerRegisteredError(
  value: unknown
): value is ShardingPodNoLongerRegisteredError
```

Added in v1.0.0

# models

## ShardingPodNoLongerRegisteredError (interface)

**Signature**

```ts
export interface ShardingPodNoLongerRegisteredError
  extends Schema.To<typeof ShardingPodNoLongerRegisteredErrorSchema_> {}
```

Added in v1.0.0

# schema

## ShardingPodNoLongerRegisteredErrorSchema

**Signature**

```ts
export declare const ShardingPodNoLongerRegisteredErrorSchema: Schema.Schema<
  {
    readonly _tag: '@effect/sharding/ShardingPodNoLongerRegisteredError'
    readonly podAddress: { readonly _id: '@effect/sharding/PodAddress'; readonly host: string; readonly port: number }
  },
  ShardingPodNoLongerRegisteredError
>
```

Added in v1.0.0

# symbols

## ShardingPodNoLongerRegisteredErrorTag

**Signature**

```ts
export declare const ShardingPodNoLongerRegisteredErrorTag: '@effect/sharding/ShardingPodNoLongerRegisteredError'
```

Added in v1.0.0
