---
title: PodWithMetadata.ts
nav_order: 14
parent: "@effect/cluster"
---

## PodWithMetadata overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [models](#models)
  - [PodWithMetadata (interface)](#podwithmetadata-interface)
- [schema](#schema)
  - [schema](#schema-1)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)
- [utils](#utils)
  - [compareVersion](#compareversion)
  - [extractVersion](#extractversion)
  - [isPodWithMetadata](#ispodwithmetadata)

---

# constructors

## make

**Signature**

```ts
export declare function make(pod: Pod.Pod, registered: number): PodWithMetadata
```

Added in v1.0.0

# models

## PodWithMetadata (interface)

**Signature**

```ts
export interface PodWithMetadata extends Schema.To<typeof schema> {}
```

Added in v1.0.0

# schema

## schema

**Signature**

```ts
export declare const schema: Schema.Schema<
  {
    readonly _id: '@effect/cluster/PodWithMetadata'
    readonly pod: {
      readonly _id: '@effect/cluster/Pod'
      readonly address: { readonly _id: '@effect/cluster/PodAddress'; readonly host: string; readonly port: number }
      readonly version: string
    }
    readonly registered: number
  },
  Data.Data<{
    readonly _id: '@effect/cluster/PodWithMetadata'
    readonly pod: Data.Data<{
      readonly _id: '@effect/cluster/Pod'
      readonly address: Data.Data<{
        readonly _id: '@effect/cluster/PodAddress'
        readonly host: string
        readonly port: number
      }>
      readonly version: string
    }>
    readonly registered: number
  }>
>
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: '@effect/cluster/PodWithMetadata'
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0

# utils

## compareVersion

**Signature**

```ts
export declare function compareVersion(a: List.List<number>, b: List.List<number>): 0 | 1 | -1
```

Added in v1.0.0

## extractVersion

**Signature**

```ts
export declare function extractVersion(pod: PodWithMetadata): List.List<number>
```

Added in v1.0.0

## isPodWithMetadata

**Signature**

```ts
export declare function isPodWithMetadata(value: unknown): value is PodWithMetadata
```

Added in v1.0.0
