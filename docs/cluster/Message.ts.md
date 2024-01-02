---
title: Message.ts
nav_order: 6
parent: "@effect/cluster"
---

## Message overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [models](#models)
  - [Any (interface)](#any-interface)
  - [AnyWithResult (type alias)](#anywithresult-type-alias)
  - [Message (interface)](#message-interface)
  - [Message (namespace)](#message-namespace)
    - [From (interface)](#from-interface)
  - [MessageSchema (interface)](#messageschema-interface)
  - [MessageWithResult (interface)](#messagewithresult-interface)
  - [MessageWithResult (namespace)](#messagewithresult-namespace)
    - [From (interface)](#from-interface-1)
  - [MessageWithResultSchema (interface)](#messagewithresultschema-interface)
- [schema](#schema)
  - [schema](#schema-1)
  - [schemaWithResult](#schemawithresult)
- [symbols](#symbols)
  - [MessageTypeId](#messagetypeid)
  - [MessageTypeId (type alias)](#messagetypeid-type-alias)
- [utils](#utils)
  - [Exit (type alias)](#exit-type-alias)
  - [Failure (type alias)](#failure-type-alias)
  - [Payload (type alias)](#payload-type-alias)
  - [Success (type alias)](#success-type-alias)
  - [exitSchema](#exitschema)
  - [isMessage](#ismessage)
  - [isMessageWithResult](#ismessagewithresult)
  - [makeEffect](#makeeffect)
  - [messageId](#messageid)

---

# models

## Any (interface)

**Signature**

```ts
export interface Any extends Message<any> {}
```

Added in v1.0.0

## AnyWithResult (type alias)

**Signature**

```ts
export type AnyWithResult = MessageWithResult<any, never, any> | MessageWithResult<any, any, any>
```

Added in v1.0.0

## Message (interface)

**Signature**

```ts
export interface Message<Payload> {
  id: MessageId.MessageId
  headers: Record<string, string>
  payload: Payload
}
```

Added in v1.0.0

## Message (namespace)

Added in v1.0.0

### From (interface)

**Signature**

```ts
export interface From<Payload> {
  readonly id: MessageId.MessageId.From
  readonly headers: Record<string, string>
  readonly payload: Payload
}
```

Added in v1.0.0

## MessageSchema (interface)

**Signature**

```ts
export interface MessageSchema<From, To> extends Schema.Schema<Message.From<From>, Message<To>> {
  make: (message: To, messageId: MessageId.MessageId) => Message<To>
  makeEffect: (message: To) => Effect.Effect<never, never, Message<To>>
}
```

Added in v1.0.0

## MessageWithResult (interface)

A `Message<A>` is a request from a data source for a value of type `A`

**Signature**

```ts
export interface MessageWithResult<Payload, Failure, Success>
  extends Message<Payload>,
    Serializable.WithResult<unknown, Failure, unknown, Success> {}
```

Added in v1.0.0

## MessageWithResult (namespace)

Added in v1.0.0

### From (interface)

**Signature**

```ts
export interface From<Payload> extends Message.From<Payload> {}
```

Added in v1.0.0

## MessageWithResultSchema (interface)

A `MessageSchema<From, To, A>` is an augmented schema that provides utilities to build the Message<A> with a valid replier.

**Signature**

```ts
export interface MessageWithResultSchema<From, To, Failure, Success>
  extends Schema.Schema<MessageWithResult.From<From>, MessageWithResult<To, Failure, Success>> {
  make: (message: To, messageId: MessageId.MessageId) => MessageWithResult<To, Failure, Success>
  makeEffect: (message: To) => Effect.Effect<never, never, MessageWithResult<To, Failure, Success>>
}
```

Added in v1.0.0

# schema

## schema

Creates both the schema and a constructor for a `Message`

**Signature**

```ts
export declare const schema: <I, A>(payload: Schema.Schema<I, A>) => MessageSchema<I, A>
```

Added in v1.0.0

## schemaWithResult

Creates both the schema and a constructor for a `MessageWithResult<A>`

**Signature**

```ts
export declare const schemaWithResult: <REI, RE, RI, RA>(
  failure: Schema.Schema<REI, RE>,
  success: Schema.Schema<RI, RA>
) => <I, A>(payload: Schema.Schema<I, A>) => MessageWithResultSchema<I, A, RE, RA>
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

## Exit (type alias)

Extracts the success type from a `MessageWithResult<A, S>`.

**Signature**

```ts
export type Exit<S> = S extends MessageWithResult<any, infer E, infer A> ? Exit_.Exit<E, A> : never
```

Added in v1.0.0

## Failure (type alias)

Extracts the success type from a `MessageWithResult<A, S>`.

**Signature**

```ts
export type Failure<S> = S extends MessageWithResult<any, infer X, any> ? X : never
```

Added in v1.0.0

## Payload (type alias)

Extracts the payload type from a `Message<A>`.

**Signature**

```ts
export type Payload<S> = S extends Message<infer X> ? X : never
```

Added in v1.0.0

## Success (type alias)

Extracts the success type from a `MessageWithResult<A, S>`.

**Signature**

```ts
export type Success<S> = S extends MessageWithResult<any, any, infer X> ? X : never
```

Added in v1.0.0

## exitSchema

**Signature**

```ts
export declare const exitSchema: <A extends AnyWithResult>(message: A) => Schema.Schema<unknown, Exit<A>>
```

Added in v1.0.0

## isMessage

**Signature**

```ts
export declare const isMessage: (value: unknown) => value is Message<unknown>
```

Added in v1.0.0

## isMessageWithResult

**Signature**

```ts
export declare const isMessageWithResult: (value: unknown) => value is MessageWithResult<unknown, unknown, unknown>
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
export declare const messageId: <Payload>(value: Message<Payload>) => MessageId.MessageId
```

Added in v1.0.0
