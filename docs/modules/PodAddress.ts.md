---
title: PodAddress.ts
nav_order: 11
parent: Modules
---

## PodAddress overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [models](#models)
  - [PodAddress (interface)](#podaddress-interface)
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
export declare function make(host: string, port: number): PodAddress
```

Added in v1.0.0

# models

## PodAddress (interface)

**Signature**

```ts
export interface PodAddress extends Schema.To<typeof schema> {}
```

Added in v1.0.0

# schema

## schema

This is the schema for a value.

**Signature**

```ts
export declare const schema: Schema.Schema<
  { readonly _id: '@effect/shardcake/PodAddress'; readonly host: string; readonly port: number },
  Data.Data<{ readonly _id: '@effect/shardcake/PodAddress'; readonly host: string; readonly port: number }>
>
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: '@effect/shardcake/PodAddress'
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0
