---
title: Message.ts
nav_order: 4
parent: "@effect/cluster"
---

## Message overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [models](#models)
  - [AnyMessage (type alias)](#anymessage-type-alias)
  - [Message (interface)](#message-interface)
  - [MessageSchema (interface)](#messageschema-interface)
- [schema](#schema)
  - [schema](#schema-1)
- [symbols](#symbols)
  - [MessageTypeId](#messagetypeid)
  - [MessageTypeId (type alias)](#messagetypeid-type-alias)
- [utils](#utils)
  - [Success (type alias)](#success-type-alias)
  - [isMessage](#ismessage)

---

# models

## AnyMessage (type alias)

A message with an unknown type of reply

**Signature**

```ts
export type AnyMessage = Message<any>
```

Added in v1.0.0

## Message (interface)

A `Message<A>` is a request from a data source for a value of type `A`

**Signature**

```ts
export interface Message<A> {
  readonly [MessageTypeId]: MessageHeader.MessageHeader<A>
}
```

Added in v1.0.0

## MessageSchema (interface)

A `MessageSchema<From, To, A>` is an augmented schema that provides utilities to build the Message<A> with a valid replier.

**Signature**

```ts
export interface MessageSchema<From, To, A> extends Schema.Schema<From, Types.Simplify<To & Message<A>>> {
  make: (message: To, messageId: MessageId.MessageId) => Types.Simplify<To & Message<A>>
  makeEffect: (message: To) => Effect.Effect<never, never, Types.Simplify<To & Message<A>>>
}
```

Added in v1.0.0

# schema

## schema

Creates both the schema and a constructor for a `Message<A>`

**Signature**

```ts
export declare const schema: <RI, RA>(
  replySchema: Schema.Schema<RI, RA>
) => <I extends object, A extends object>(item: Schema.Schema<I, A>) => MessageSchema<I, A, RA>
```

Added in v1.0.0

# symbols

## MessageTypeId

**Signature**

```ts
export declare const MessageTypeId: typeof MessageTypeId
```

Added in v1.0.0

## MessageTypeId (type alias)

**Signature**

```ts
export type MessageTypeId = typeof MessageTypeId
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
export declare const isMessage: <R>(value: unknown) => value is Message<R>
```

Added in v1.0.0
