---
title: Message.ts
nav_order: 5
parent: "@effect/cluster"
---

## Message overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [models](#models)
  - [Message (interface)](#message-interface)
  - [MessageSchema (interface)](#messageschema-interface)
- [schema](#schema)
  - [schema](#schema-1)
- [utils](#utils)
  - [Success (type alias)](#success-type-alias)
  - [isMessage](#ismessage)

---

# models

## Message (interface)

A `Message<A>` is a request from a data source for a value of type `A`

**Signature**

```ts
export interface Message<A> {
  readonly replier: Replier.Replier<A>
}
```

Added in v1.0.0

## MessageSchema (interface)

A `MessageSchema<From, To, A>` is an augmented schema that provides utilities to build the Message<A> with a valid replier.

**Signature**

```ts
export interface MessageSchema<From, To, A> extends Schema.Schema<From, Types.Simplify<To & Message<A>>> {
  make: (message: To, replyId: ReplyId.ReplyId) => Types.Simplify<To & Message<A>>
  makeEffect: (message: To) => Effect.Effect<never, never, Types.Simplify<To & Message<A>>>
}
```

Added in v1.0.0

# schema

## schema

Creates both the schema and a constructor for a `Message<A>`

**Signature**

```ts
export declare function schema<RI, RA>(replySchema: Schema.Schema<RI, RA>)
```

Added in v1.0.0

# utils

## Success (type alias)

Extracts the success type from a `Message<A>`.

**Signature**

```ts
export type Success<A> = A extends Message<infer X> ? X : never
```

Added in v1.0.0

## isMessage

**Signature**

```ts
export declare function isMessage<R>(value: unknown): value is Message<R>
```

Added in v1.0.0
