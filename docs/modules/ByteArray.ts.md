---
title: ByteArray.ts
nav_order: 3
parent: Modules
---

## ByteArray overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [models](#models)
  - [ByteArray (interface)](#bytearray-interface)
- [schema](#schema)
  - [schema](#schema-1)
- [symbol](#symbol)
  - [TypeId](#typeid)

---

# constructors

## make

Construct a new `ByteArray` from its internal string value.

**Signature**

```ts
export declare function make(value: string): ByteArray
```

Added in v1.0.0

# models

## ByteArray (interface)

**Signature**

```ts
export interface ByteArray extends Schema.To<typeof schema> {}
```

Added in v1.0.0

# schema

## schema

This is the schema for a value.

**Signature**

```ts
export declare const schema: Schema.Schema<
  { readonly _id: '@effect/shardcake/ByteArray'; readonly value: string },
  Data<{ readonly _id: '@effect/shardcake/ByteArray'; readonly value: string }>
>
```

Added in v1.0.0

# symbol

## TypeId

**Signature**

```ts
export declare const TypeId: '@effect/shardcake/ByteArray'
```

Added in v1.0.0
