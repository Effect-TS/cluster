---
title: SerializedEnvelope.ts
nav_order: 19
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
  - [SerializedEnvelopeTypeId](#serializedenvelopetypeid)
  - [SerializedEnvelopeTypeId (type alias)](#serializedenvelopetypeid-type-alias)
- [utils](#utils)
  - [isSerializedEnvelope](#isserializedenvelope)

---

# constructors

## make

Construct a new `SerializedEnvelope`

**Signature**

```ts
export declare const make: (
  entityType: string,
  entityId: string,
  body: SerializedMessage.SerializedMessage
) => SerializedEnvelope
```

Added in v1.0.0

# models

## SerializedEnvelope (interface)

**Signature**

```ts
export interface SerializedEnvelope
  extends Data.Data<{
    readonly [SerializedEnvelopeTypeId]: SerializedEnvelopeTypeId
    readonly entityId: string
    readonly entityType: string
    readonly body: SerializedMessage.SerializedMessage
  }> {}
```

Added in v1.0.0

# schema

## schema

This is the schema for a value.

**Signature**

```ts
export declare const schema: Schema.Schema<
  {
    readonly "@effect/cluster/SerializedEnvelope": "@effect/cluster/SerializedEnvelope"
    readonly entityId: string
    readonly entityType: string
    readonly body: {
      readonly "@effect/cluster/SerializedMessage": "@effect/cluster/SerializedMessage"
      readonly value: string
    }
  },
  SerializedEnvelope
>
```

Added in v1.0.0

# symbols

## SerializedEnvelopeTypeId

**Signature**

```ts
export declare const SerializedEnvelopeTypeId: typeof SerializedEnvelopeTypeId
```

Added in v1.0.0

## SerializedEnvelopeTypeId (type alias)

**Signature**

```ts
export type SerializedEnvelopeTypeId = typeof SerializedEnvelopeTypeId
```

Added in v1.0.0

# utils

## isSerializedEnvelope

**Signature**

```ts
export declare const isSerializedEnvelope: (value: unknown) => value is SerializedEnvelope
```

Added in v1.0.0
