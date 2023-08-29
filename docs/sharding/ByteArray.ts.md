---
title: ByteArray.ts
nav_order: 3
parent: "@effect/sharding"
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
  - [schemaFromString](#schemafromstring)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)
- [utils](#utils)
  - [isByteArray](#isbytearray)

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
  { readonly _id: '@effect/sharding/ByteArray'; readonly value: string },
  Data.Data<{ readonly _id: '@effect/sharding/ByteArray'; readonly value: string }>
>
```

Added in v1.0.0

## schemaFromString

This is the schema for a value starting from a string.

**Signature**

```ts
export declare const schemaFromString: Schema.Schema<string, ByteArray>
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: '@effect/sharding/ByteArray'
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0

# utils

## isByteArray

**Signature**

```ts
export declare function isByteArray(value: unknown): value is ByteArray
```

Added in v1.0.0
