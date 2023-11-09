---
title: ShardId.ts
nav_order: 23
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
- [schema](#schema)
  - [schema](#schema-1)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)

---

# constructors

## make

**Signature**

```ts
export declare function make(value: number): ShardId
```

Added in v1.0.0

# models

## ShardId (interface)

**Signature**

```ts
export interface ShardId extends Schema.Schema.To<typeof schema> {}
```

Added in v1.0.0

# schema

## schema

This is the schema for a value.

**Signature**

```ts
export declare const schema: Schema.Schema<
  { readonly _id: "./ShardId"; readonly value: number },
  Data.Data<{ readonly _id: "./ShardId"; readonly value: number }>
>
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: "./ShardId"
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0
