---
title: ShardingError/ShardingEntityTypeNotRegisteredError.ts
nav_order: 29
parent: Modules
---

## ShardingEntityTypeNotRegisteredError overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [ShardingEntityTypeNotRegisteredError](#shardingentitytypenotregisterederror)
  - [isShardingEntityTypeNotRegisteredError](#isshardingentitytypenotregisterederror)
- [models](#models)
  - [ShardingEntityTypeNotRegisteredError (interface)](#shardingentitytypenotregisterederror-interface)
- [schema](#schema)
  - [ShardingEntityTypeNotRegisteredErrorSchema](#shardingentitytypenotregisterederrorschema)
- [symbols](#symbols)
  - [ShardingEntityTypeNotRegisteredErrorTag](#shardingentitytypenotregisterederrortag)

---

# constructors

## ShardingEntityTypeNotRegisteredError

**Signature**

```ts
export declare function ShardingEntityTypeNotRegisteredError(
  entityType: string,
  podAddress: PodAddress.PodAddress
): ShardingEntityTypeNotRegisteredError
```

Added in v1.0.0

## isShardingEntityTypeNotRegisteredError

**Signature**

```ts
export declare function isShardingEntityTypeNotRegisteredError(
  value: unknown
): value is ShardingEntityTypeNotRegisteredError
```

Added in v1.0.0

# models

## ShardingEntityTypeNotRegisteredError (interface)

**Signature**

```ts
export interface ShardingEntityTypeNotRegisteredError
  extends Schema.To<typeof ShardingEntityTypeNotRegisteredErrorSchema_> {}
```

Added in v1.0.0

# schema

## ShardingEntityTypeNotRegisteredErrorSchema

**Signature**

```ts
export declare const ShardingEntityTypeNotRegisteredErrorSchema: Schema.Schema<
  {
    readonly entityType: string
    readonly _tag: '@effect/sharding/ShardingEntityTypeNotRegisteredError'
    readonly podAddress: { readonly _id: '@effect/sharding/PodAddress'; readonly host: string; readonly port: number }
  },
  ShardingEntityTypeNotRegisteredError
>
```

Added in v1.0.0

# symbols

## ShardingEntityTypeNotRegisteredErrorTag

**Signature**

```ts
export declare const ShardingEntityTypeNotRegisteredErrorTag: '@effect/sharding/ShardingEntityTypeNotRegisteredError'
```

Added in v1.0.0
