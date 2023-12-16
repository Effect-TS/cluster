---
title: Pod.ts
nav_order: 8
parent: "@effect/cluster"
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
  - [PodTypeId](#podtypeid)
  - [PodTypeId (type alias)](#podtypeid-type-alias)
- [utils](#utils)
  - [isPod](#ispod)

---

# constructors

## make

**Signature**

```ts
export declare const make: (address: PodAddress.PodAddress, version: string) => Pod
```

Added in v1.0.0

# models

## Pod (interface)

**Signature**

```ts
export interface Pod
  extends Data.Data<{
    readonly [PodTypeId]: PodTypeId
    readonly address: PodAddress.PodAddress
    readonly version: string
  }> {}
```

Added in v1.0.0

# schema

## schema

**Signature**

```ts
export declare const schema: Schema.Schema<
  {
    readonly "@effect/cluster/Pod": "@effect/cluster/Pod"
    readonly address: {
      readonly "@effect/cluster/PodAddress": "@effect/cluster/PodAddress"
      readonly host: string
      readonly port: number
    }
    readonly version: string
  },
  Pod
>
```

Added in v1.0.0

# symbols

## PodTypeId

**Signature**

```ts
export declare const PodTypeId: typeof PodTypeId
```

Added in v1.0.0

## PodTypeId (type alias)

**Signature**

```ts
export type PodTypeId = typeof PodTypeId
```

Added in v1.0.0

# utils

## isPod

**Signature**

```ts
export declare const isPod: (value: unknown) => value is Pod
```

Added in v1.0.0
