---
title: MessageHeader.ts
nav_order: 5
parent: "@effect/cluster"
---

## MessageHeader overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [models](#models)
  - [MessageHeader (interface)](#messageheader-interface)
- [schema](#schema)
  - [schema](#schema-1)
- [symbols](#symbols)
  - [MessageHeaderTypeId](#messageheadertypeid)
  - [MessageHeaderTypeId (type alias)](#messageheadertypeid-type-alias)
- [utils](#utils)
  - [isMessageHeader](#ismessageheader)

---

# constructors

## make

**Signature**

```ts
export declare const make: <I, A>(id: MessageId.MessageId, schema: Schema.Schema<I, A>) => MessageHeader<A>
```

Added in v1.0.0

# models

## MessageHeader (interface)

**Signature**

```ts
export interface MessageHeader<A> {
  readonly [MessageHeaderTypeId]: MessageHeaderTypeId
  readonly id: MessageId.MessageId
  readonly schema: Schema.Schema<unknown, A>
}
```

Added in v1.0.0

# schema

## schema

**Signature**

```ts
export declare const schema: <I, A>(schema: Schema.Schema<I, A>) => Schema.Schema<I, MessageHeader<A>>
```

Added in v1.0.0

# symbols

## MessageHeaderTypeId

**Signature**

```ts
export declare const MessageHeaderTypeId: typeof MessageHeaderTypeId
```

Added in v1.0.0

## MessageHeaderTypeId (type alias)

**Signature**

```ts
export type MessageHeaderTypeId = typeof MessageHeaderTypeId
```

Added in v1.0.0

# utils

## isMessageHeader

**Signature**

```ts
export declare const isMessageHeader: <A>(value: unknown) => value is MessageHeader<A>
```

Added in v1.0.0
