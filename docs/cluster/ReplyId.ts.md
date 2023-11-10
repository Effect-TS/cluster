---
title: ReplyId.ts
nav_order: 14
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
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)
- [utils](#utils)
  - [isReplyId](#isreplyid)

---

# constructors

## make

Construct a new `ReplyId` from its internal id string value.

**Signature**

```ts
export declare function make(value: string): ReplyId
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
export interface ReplyId extends Schema.Schema.To<typeof schema> {}
```

Added in v1.0.0

# schema

## schema

This is the schema for a value.

**Signature**

```ts
export declare const schema: Schema.Schema<
  { readonly _id: "@effect/cluster/ReplyId"; readonly value: string },
  Data.Data<{ readonly _id: "@effect/cluster/ReplyId"; readonly value: string }>
>
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: "@effect/cluster/ReplyId"
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0

# utils

## isReplyId

**Signature**

```ts
export declare function isReplyId(value: unknown): value is ReplyId
```

Added in v1.0.0
