---
title: SerializedMessage.ts
nav_order: 19
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
- [symbols](#symbols)
  - [SerializedMessageTypeId](#serializedmessagetypeid)
  - [SerializedMessageTypeId (type alias)](#serializedmessagetypeid-type-alias)
- [utils](#utils)
  - [isSerializedMessage](#isserializedmessage)

---

# constructors

## make

Construct a new `SerializedMessage` from its internal string value.

**Signature**

```ts
export declare const make: (value: string) => SerializedMessage
```

Added in v1.0.0

# models

## SerializedMessage (interface)

**Signature**

```ts
export interface SerializedMessage
  extends Data.Data<{
    readonly [SerializedMessageTypeId]: SerializedMessageTypeId
    readonly value: string
  }> {}
```

Added in v1.0.0

# schema

## schema

This is the schema for a value.

**Signature**

```ts
export declare const schema: Schema.Schema<
  { readonly "@effect/cluster/SerializedMessage": "@effect/cluster/SerializedMessage"; readonly value: string },
  SerializedMessage
>
```

Added in v1.0.0

# symbols

## SerializedMessageTypeId

**Signature**

```ts
export declare const SerializedMessageTypeId: typeof SerializedMessageTypeId
```

Added in v1.0.0

## SerializedMessageTypeId (type alias)

**Signature**

```ts
export type SerializedMessageTypeId = typeof SerializedMessageTypeId
```

Added in v1.0.0

# utils

## isSerializedMessage

**Signature**

```ts
export declare const isSerializedMessage: (value: unknown) => value is SerializedMessage
```

Added in v1.0.0
