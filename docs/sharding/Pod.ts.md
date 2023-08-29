---
title: Pod.ts
nav_order: 10
parent: "@effect/sharding"
---

## Pod overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [models](#models)
  - [Pod (interface)](#pod-interface)
- [schema](#schema)
  - [schema](#schema-1)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)
- [utils](#utils)
  - [isPod](#ispod)

---

# constructors

## make

**Signature**

```ts
export declare function make(address: PodAddress.PodAddress, version: string): Pod
```

Added in v1.0.0

# models

## Pod (interface)

**Signature**

```ts
export interface Pod extends Schema.To<typeof schema> {}
```

Added in v1.0.0

# schema

## schema

**Signature**

```ts
export declare const schema: Schema.Schema<
  {
    readonly _id: '@effect/sharding/Pod'
    readonly address: { readonly _id: '@effect/sharding/PodAddress'; readonly host: string; readonly port: number }
    readonly version: string
  },
  Data.Data<{
    readonly _id: '@effect/sharding/Pod'
    readonly address: Data.Data<{
      readonly _id: '@effect/sharding/PodAddress'
      readonly host: string
      readonly port: number
    }>
    readonly version: string
  }>
>
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: '@effect/sharding/Pod'
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0

# utils

## isPod

**Signature**

```ts
export declare function isPod(value: unknown): value is Pod
```

Added in v1.0.0
