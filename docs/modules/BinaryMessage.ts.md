---
title: BinaryMessage.ts
nav_order: 1
parent: Modules
---

## BinaryMessage overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [models](#models)
  - [BinaryMessage (interface)](#binarymessage-interface)
- [schema](#schema)
  - [schema](#schema-1)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)

---

# constructors

## make

Construct a new `BinaryMessage`

**Signature**

```ts
export declare function make(
  entityId: string,
  entityType: string,
  body: ByteArray.ByteArray,
  replyId: Option.Option<ReplyId.ReplyId>
): BinaryMessage
```

Added in v1.0.0

# models

## BinaryMessage (interface)

**Signature**

```ts
export interface BinaryMessage extends Schema.To<typeof schema> {}
```

Added in v1.0.0

# schema

## schema

This is the schema for a value.

**Signature**

```ts
export declare const schema: Schema.Schema<
  {
    readonly _id: '@effect/shardcake/BinaryMessage'
    readonly entityId: string
    readonly entityType: string
    readonly body: { readonly _id: '@effect/shardcake/ByteArray'; readonly value: string }
    readonly replyId:
      | { readonly _tag: 'None' }
      | { readonly _tag: 'Some'; readonly value: { readonly _id: '@effect/shardcake/ReplyId'; readonly value: string } }
  },
  Data<{
    readonly _id: '@effect/shardcake/BinaryMessage'
    readonly entityId: string
    readonly entityType: string
    readonly body: Data<{ readonly _id: '@effect/shardcake/ByteArray'; readonly value: string }>
    readonly replyId: Option<Data<{ readonly _id: '@effect/shardcake/ReplyId'; readonly value: string }>>
  }>
>
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: '@effect/shardcake/BinaryMessage'
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0
