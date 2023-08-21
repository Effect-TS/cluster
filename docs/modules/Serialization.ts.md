---
title: Serialization.ts
nav_order: 23
parent: Modules
---

## Serialization overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [context](#context)
  - [Serialization](#serialization)
- [layers](#layers)
  - [json](#json)
- [models](#models)
  - [Serialization (interface)](#serialization-interface)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)

---

# context

## Serialization

**Signature**

```ts
export declare const Serialization: Tag<Serialization, Serialization>
```

Added in v1.0.0

# layers

## json

A layer that uses Java serialization for encoding and decoding messages.
This is useful for testing and not recommended to use in production.

**Signature**

```ts
export declare const json: Layer.Layer<never, never, Serialization>
```

Added in v1.0.0

# models

## Serialization (interface)

An interface to serialize user messages that will be sent between pods.

**Signature**

```ts
export interface Serialization {
  [TypeId]: {}

  /**
   * Transforms the given message into binary
   * @since 1.0.0
   */
  encode<I, A>(
    message: A,
    schema: Schema.Schema<I, A>
  ): Effect.Effect<never, ShardError.EncodeError, ByteArray.ByteArray>

  /**
   * Transform binary back into the given type
   * @since 1.0.0
   */
  decode<I, A>(bytes: ByteArray.ByteArray, schema: Schema.Schema<I, A>): Effect.Effect<never, ShardError.DecodeError, A>
}
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: typeof TypeId
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0
