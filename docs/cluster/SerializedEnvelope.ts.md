---
title: SerializedEnvelope.ts
nav_order: 16
parent: "@effect/cluster"
---

## SerializedEnvelope overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [models](#models)
  - [SerializedEnvelope (interface)](#serializedenvelope-interface)
- [schema](#schema)
  - [schema](#schema-1)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)
- [utils](#utils)
  - [isSerializedEnvelope](#isserializedenvelope)

---

# constructors

## make

Construct a new `SerializedEnvelope`

**Signature**

```ts
export declare function make(
  entityId: string,
  entityType: string,
  body: SerializedMessage.SerializedMessage,
  replyId: Option.Option<ReplyId.ReplyId>
): SerializedEnvelope
```

Added in v1.0.0

# models

## SerializedEnvelope (interface)

**Signature**

```ts
export interface SerializedEnvelope extends Schema.Schema.To<typeof schema> {}
```

Added in v1.0.0

# schema

## schema

This is the schema for a value.

**Signature**

```ts
export declare const schema: Schema.Schema<
  {
    readonly _id: "@effect/cluster/SerializedEnvelope"
    readonly entityType: string
    readonly entityId: string
    readonly body: { readonly _id: "@effect/cluster/SerializedMessage"; readonly value: string }
    readonly replyId:
      | { readonly _tag: "None" }
      | { readonly _tag: "Some"; readonly value: { readonly _id: "@effect/cluster/ReplyId"; readonly value: string } }
  },
  Data.Data<{
    readonly _id: "@effect/cluster/SerializedEnvelope"
    readonly entityType: string
    readonly entityId: string
    readonly body: Data.Data<{ readonly _id: "@effect/cluster/SerializedMessage"; readonly value: string }>
    readonly replyId: Option.Option<Data.Data<{ readonly _id: "@effect/cluster/ReplyId"; readonly value: string }>>
  }>
>
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: "@effect/cluster/SerializedEnvelope"
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0

# utils

## isSerializedEnvelope

**Signature**

```ts
export declare function isSerializedEnvelope(value: unknown): value is SerializedEnvelope
```

Added in v1.0.0
