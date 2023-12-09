---
title: MessageId.ts
nav_order: 5
parent: "@effect/cluster"
---

## MessageId overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
  - [makeEffect](#makeeffect)
- [models](#models)
  - [MessageId (interface)](#messageid-interface)
- [schema](#schema)
  - [schema](#schema-1)
- [symbols](#symbols)
  - [MessageIdTypeId](#messageidtypeid)
  - [MessageIdTypeId (type alias)](#messageidtypeid-type-alias)
- [utils](#utils)
  - [isMessageId](#ismessageid)

---

# constructors

## make

Construct a new `MessageId` from its internal id string value.

**Signature**

```ts
export declare const make: typeof internal.make
```

Added in v1.0.0

## makeEffect

Construct a new `MessageId` by internally building a UUID.

**Signature**

```ts
export declare const makeEffect: Effect.Effect<never, never, MessageId>
```

Added in v1.0.0

# models

## MessageId (interface)

**Signature**

```ts
export interface MessageId
  extends Data.Data<{
    readonly [MessageIdTypeId]: MessageIdTypeId
    readonly value: string
  }> {}
```

Added in v1.0.0

# schema

## schema

This is the schema for a value.

**Signature**

```ts
export declare const schema: Schema.Schema<
  { readonly "@effect/cluster/MessageId": "@effect/cluster/MessageId"; readonly value: string },
  MessageId
>
```

Added in v1.0.0

# symbols

## MessageIdTypeId

**Signature**

```ts
export declare const MessageIdTypeId: typeof MessageIdTypeId
```

Added in v1.0.0

## MessageIdTypeId (type alias)

**Signature**

```ts
export type MessageIdTypeId = typeof MessageIdTypeId
```

Added in v1.0.0

# utils

## isMessageId

**Signature**

```ts
export declare const isMessageId: (value: unknown) => value is MessageId
```

Added in v1.0.0
