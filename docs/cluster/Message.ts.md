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
  - [Message (interface)](#message-interface)
  - [MessageSchema (interface)](#messageschema-interface)
  - [MessageWithResult (interface)](#messagewithresult-interface)
- [schema](#schema)
  - [schemaWithResult](#schemawithresult)
- [utils](#utils)
  - [Success (type alias)](#success-type-alias)
  - [isMessage](#ismessage)
  - [isMessageWithResult](#ismessagewithresult)
  - [makeEffect](#makeeffect)
  - [messageId](#messageid)
  - [successSchema](#successschema)

---

# models

## Message (interface)

**Signature**

```ts
export interface Message extends PrimaryKey.PrimaryKey {}
```

Added in v1.0.0

## MessageSchema (interface)

A `MessageSchema<From, To, A>` is an augmented schema that provides utilities to build the Message<A> with a valid replier.

**Signature**

```ts
export interface MessageSchema<From, To, A> extends Schema.Schema<From, Types.Simplify<To & MessageWithResult<A>>> {
  make: (message: To, messageId: MessageId.MessageId) => Types.Simplify<To & MessageWithResult<A>>
  makeEffect: (message: To) => Effect.Effect<never, never, Types.Simplify<To & MessageWithResult<A>>>
}
```

Added in v1.0.0

## MessageWithResult (interface)

A `Message<A>` is a request from a data source for a value of type `A`

**Signature**

```ts
export interface MessageWithResult<A> extends Message, Serializable.WithResult<never, never, unknown, A> {}
```

Added in v1.0.0

# schema

## schemaWithResult

Creates both the schema and a constructor for a `Message<A>`

**Signature**

```ts
export declare const schemaWithResult: <RI, RA>(
  replySchema: Schema.Schema<RI, RA>
) => <I extends object, A extends object>(item: Schema.Schema<I, A>) => MessageSchema<I, A, RA>
```

Added in v1.0.0

# utils

## Success (type alias)

Extracts the success type from a `Message<A>`.

**Signature**

```ts
export type Success<A> = A extends MessageWithResult<infer X> ? X : never
```

Added in v1.0.0

## isMessage

**Signature**

```ts
export declare const isMessage: (value: unknown) => value is Message
```

Added in v1.0.0

## isMessageWithResult

**Signature**

```ts
export declare const isMessageWithResult: <R>(value: unknown) => value is MessageWithResult<R>
```

Added in v1.0.0

## makeEffect

**Signature**

```ts
export declare const makeEffect: typeof internal.makeEffect
```

Added in v1.0.0

## messageId

**Signature**

```ts
export declare const messageId: (value: Message) => MessageId.MessageId
```

Added in v1.0.0

## successSchema

**Signature**

```ts
export declare const successSchema: <A>(message: MessageWithResult<A>) => Schema.Schema<unknown, A>
```

Added in v1.0.0
