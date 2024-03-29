---
title: Serialization.ts
nav_order: 17
parent: "@effect/cluster"
---

## Serialization overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [context](#context)
  - [Serialization](#serialization)
- [layers](#layers)
  - [json](#json)
- [models](#models)
  - [Serialization (interface)](#serialization-interface)
- [symbols](#symbols)
  - [SerializationTypeId](#serializationtypeid)
  - [SerializationTypeId (type alias)](#serializationtypeid-type-alias)

---

# constructors

## make

**Signature**

```ts
export declare const make: (args: Omit<Serialization, typeof SerializationTypeId>) => Serialization
```

Added in v1.0.0

# context

## Serialization

**Signature**

```ts
export declare const Serialization: Context.Tag<Serialization, Serialization>
```

Added in v1.0.0

# layers

## json

A layer that uses JSON serialization for encoding and decoding messages.
This is useful for testing and not recommended to use in production.

**Signature**

```ts
export declare const json: Layer.Layer<Serialization, never, never>
```

Added in v1.0.0

# models

## Serialization (interface)

An interface to serialize user messages that will be sent between pods.

**Signature**

```ts
export interface Serialization {
  /**
   * @since 1.0.0
   */
  readonly [SerializationTypeId]: SerializationTypeId

  /**
   * Transforms the given message into binary
   * @since 1.0.0
   */
  readonly encode: <A, I>(
    schema: Schema.Schema<A, I>,
    message: A
  ) => Effect.Effect<SerializedMessage.SerializedMessage, ShardingError.ShardingErrorSerialization>

  /**
   * Transform binary back into the given type
   * @since 1.0.0
   */
  readonly decode: <A, I>(
    schema: Schema.Schema<A, I>,
    bytes: SerializedMessage.SerializedMessage
  ) => Effect.Effect<A, ShardingError.ShardingErrorSerialization>
}
```

Added in v1.0.0

# symbols

## SerializationTypeId

**Signature**

```ts
export declare const SerializationTypeId: typeof SerializationTypeId
```

Added in v1.0.0

## SerializationTypeId (type alias)

**Signature**

```ts
export type SerializationTypeId = typeof SerializationTypeId
```

Added in v1.0.0
