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
  - [AnyMessage (interface)](#anymessage-interface)
  - [AnyMessageWithResult (interface)](#anymessagewithresult-interface)
  - [Message (interface)](#message-interface)
  - [MessageSchema (interface)](#messageschema-interface)
  - [MessageWithResult (interface)](#messagewithresult-interface)
  - [MessageWithResultSchema (interface)](#messagewithresultschema-interface)
- [schema](#schema)
  - [schema](#schema-1)
  - [schemaWithResult](#schemawithresult)
- [symbols](#symbols)
  - [MessageTypeId](#messagetypeid)
  - [MessageTypeId (type alias)](#messagetypeid-type-alias)
- [utils](#utils)
  - [Success (type alias)](#success-type-alias)
  - [isMessage](#ismessage)
  - [isMessageWithResult](#ismessagewithresult)
  - [makeEffect](#makeeffect)
  - [messageId](#messageid)
  - [successSchema](#successschema)

---

# models

## AnyMessage (interface)

**Signature**

```ts
export interface AnyMessage extends Message<any> {}
```

Added in v1.0.0

## AnyMessageWithResult (interface)

**Signature**

```ts
export interface AnyMessageWithResult extends MessageWithResult<any, any> {}
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

## MessageSchema (interface)

**Signature**

```ts
export interface MessageSchema<From, To>
  extends Schema.Schema<
    {
      readonly id: { readonly "@effect/cluster/MessageId": "@effect/cluster/MessageId"; readonly value: string }
      readonly headers: { readonly [x: string]: string }
      readonly payload: From
    },
    Message<To>
  > {
  make: (message: To, messageId: MessageId.MessageId) => Message<To>
  makeEffect: (message: To) => Effect.Effect<never, never, Message<To>>
}
```

Added in v1.0.0

## MessageWithResult (interface)

A `Message<A>` is a request from a data source for a value of type `A`

**Signature**

```ts
export interface MessageWithResult<Payload, Result>
  extends Message<Payload>,
    Serializable.WithResult<never, never, unknown, Result> {}
```

Added in v1.0.0

## MessageWithResultSchema (interface)

A `MessageSchema<From, To, A>` is an augmented schema that provides utilities to build the Message<A> with a valid replier.

**Signature**

```ts
export interface MessageWithResultSchema<From, To, Result>
  extends Schema.Schema<
    Types.Simplify<
      From & {
        readonly "@effect/cluster/Message": {
          readonly "@effect/cluster/MessageId": "@effect/cluster/MessageId"
          readonly value: string
        }
      }
    >,
    MessageWithResult<To, Result>
  > {
  make: (message: To, messageId: MessageId.MessageId) => MessageWithResult<To, Result>
  makeEffect: (message: To) => Effect.Effect<never, never, MessageWithResult<To, Result>>
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
export declare const schemaWithResult: <RI, RA>(
  success: Schema.Schema<RI, RA>
) => <I, A>(payload: Schema.Schema<I, A>) => MessageWithResultSchema<I, A, RA>
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

Extracts the success type from a `MessageWithResult<A, S>`.

**Signature**

```ts
export type Success<S> = S extends MessageWithResult<any, infer X> ? X : never
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
export declare const isMessageWithResult: (value: unknown) => value is MessageWithResult<unknown, unknown>
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

## successSchema

**Signature**

```ts
export declare const successSchema: <Payload, Result>(
  message: MessageWithResult<Payload, Result>
) => Schema.Schema<unknown, Result>
```

Added in v1.0.0
