---
title: ShardId.ts
nav_order: 20
parent: "@effect/cluster"
---

## ShardId overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [models](#models)
  - [ShardId (interface)](#shardid-interface)
  - [ShardId (namespace)](#shardid-namespace)
    - [From (interface)](#from-interface)
- [schema](#schema)
  - [schema](#schema-1)
- [symbols](#symbols)
  - [ShardIdTypeId](#shardidtypeid)
  - [ShardIdTypeId (type alias)](#shardidtypeid-type-alias)

---

# constructors

## make

**Signature**

```ts
export declare const make: (value: number) => ShardId
```

Added in v1.0.0

# models

## ShardId (interface)

**Signature**

```ts
export interface ShardId {
  readonly [ShardIdTypeId]: ShardIdTypeId
  readonly value: number
}
```

Added in v1.0.0

## ShardId (namespace)

Added in v1.0.0

### From (interface)

**Signature**

```ts
export interface From {
  readonly "@effect/cluster/ShardId": "@effect/cluster/ShardId"
  readonly value: number
}
```

Added in v1.0.0

# schema

## schema

This is the schema for a value.

**Signature**

```ts
export declare const schema: Schema.Schema<ShardId, ShardId.From, never>
```

Added in v1.0.0

# symbols

## ShardIdTypeId

**Signature**

```ts
export declare const ShardIdTypeId: typeof ShardIdTypeId
```

Added in v1.0.0

## ShardIdTypeId (type alias)

**Signature**

```ts
export type ShardIdTypeId = typeof ShardIdTypeId
```

Added in v1.0.0
