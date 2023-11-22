---
title: SerializedMessage.ts
nav_order: 18
parent: "@effect/cluster"
---

## SerializedMessage overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [models](#models)
  - [SerializedMessage (interface)](#serializedmessage-interface)
- [schema](#schema)
  - [schema](#schema-1)
  - [schemaFromString](#schemafromstring)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)
- [utils](#utils)
  - [isSerializedMessage](#isserializedmessage)

---

# constructors

## make

Construct a new `SerializedMessage` from its internal string value.

**Signature**

```ts
export declare function make(value: string): SerializedMessage
```

Added in v1.0.0

# models

## SerializedMessage (interface)

**Signature**

```ts
export interface SerializedMessage extends Schema.Schema.To<typeof schema> {}
```

Added in v1.0.0

# schema

## schema

This is the schema for a value.

**Signature**

```ts
export declare const schema: Schema.Schema<
  { readonly _id: "@effect/cluster/SerializedMessage"; readonly value: string },
  Data.Data<{ readonly _id: "@effect/cluster/SerializedMessage"; readonly value: string }>
>
```

Added in v1.0.0

## schemaFromString

This is the schema for a value starting from a string.

**Signature**

```ts
export declare const schemaFromString: Schema.Schema<string, SerializedMessage>
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: "@effect/cluster/SerializedMessage"
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0

# utils

## isSerializedMessage

**Signature**

```ts
export declare function isSerializedMessage(value: unknown): value is SerializedMessage
```

Added in v1.0.0
