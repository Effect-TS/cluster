---
title: ReplyId.ts
nav_order: 15
parent: "@effect/cluster"
---

## ReplyId overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
  - [makeEffect](#makeeffect)
- [models](#models)
  - [ReplyId (interface)](#replyid-interface)
- [schema](#schema)
  - [schema](#schema-1)
- [symbols](#symbols)
  - [ReplyIdTypeId](#replyidtypeid)
  - [ReplyIdTypeId (type alias)](#replyidtypeid-type-alias)
- [utils](#utils)
  - [isReplyId](#isreplyid)

---

# constructors

## make

Construct a new `ReplyId` from its internal id string value.

**Signature**

```ts
export declare const make: typeof internal.make
```

Added in v1.0.0

## makeEffect

Construct a new `ReplyId` by internally building a UUID.

**Signature**

```ts
export declare const makeEffect: Effect.Effect<never, never, ReplyId>
```

Added in v1.0.0

# models

## ReplyId (interface)

**Signature**

```ts
export interface ReplyId
  extends Data.Data<{
    readonly [ReplyIdTypeId]: ReplyIdTypeId
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
  { readonly "@effect/cluster/ReplyId": "@effect/cluster/ReplyId"; readonly value: string },
  ReplyId
>
```

Added in v1.0.0

# symbols

## ReplyIdTypeId

**Signature**

```ts
export declare const ReplyIdTypeId: typeof ReplyIdTypeId
```

Added in v1.0.0

## ReplyIdTypeId (type alias)

**Signature**

```ts
export type ReplyIdTypeId = typeof ReplyIdTypeId
```

Added in v1.0.0

# utils

## isReplyId

**Signature**

```ts
export declare const isReplyId: (value: unknown) => value is ReplyId
```

Added in v1.0.0
