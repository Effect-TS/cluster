---
title: PodAddress.ts
nav_order: 9
parent: "@effect/cluster"
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
  - [PodAddressTypeId](#podaddresstypeid)
  - [PodAddressTypeId (type alias)](#podaddresstypeid-type-alias)
- [utils](#utils)
  - [isPodAddress](#ispodaddress)

---

# constructors

## make

**Signature**

```ts
export declare const make: (host: string, port: number) => PodAddress
```

Added in v1.0.0

# models

## PodAddress (interface)

**Signature**

```ts
export interface PodAddress
  extends Data.Data<{
    readonly [PodAddressTypeId]: PodAddressTypeId
    readonly host: string
    readonly port: number
  }> {}
```

Added in v1.0.0

# schema

## schema

This is the schema for a value.

**Signature**

```ts
export declare const schema: Schema.Schema<
  { readonly "@effect/cluster/PodAddress": "@effect/cluster/PodAddress"; readonly host: string; readonly port: number },
  PodAddress
>
```

Added in v1.0.0

# symbols

## PodAddressTypeId

**Signature**

```ts
export declare const PodAddressTypeId: typeof PodAddressTypeId
```

Added in v1.0.0

## PodAddressTypeId (type alias)

**Signature**

```ts
export type PodAddressTypeId = typeof PodAddressTypeId
```

Added in v1.0.0

# utils

## isPodAddress

**Signature**

```ts
export declare const isPodAddress: (value: unknown) => value is PodAddress
```

Added in v1.0.0
