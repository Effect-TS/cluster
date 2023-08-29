---
title: StreamReplier.ts
nav_order: 41
parent: "@effect/sharding"
---

## StreamReplier overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [streamReplier](#streamreplier)
- [models](#models)
  - [StreamReplier (interface)](#streamreplier-interface)
- [schema](#schema)
  - [schema](#schema-1)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)

---

# constructors

## streamReplier

**Signature**

```ts
export declare const streamReplier: <I, A>(id: ReplyId.ReplyId, schema: Schema.Schema<I, A>) => StreamReplier<A>
```

Added in v1.0.0

# models

## StreamReplier (interface)

**Signature**

```ts
export interface StreamReplier<A> {
  _id: TypeId
  id: ReplyId.ReplyId
  schema: Schema.Schema<unknown, A>
}
```

Added in v1.0.0

# schema

## schema

**Signature**

```ts
export declare const schema: <I, A>(schema: Schema.Schema<I, A>) => Schema.Schema<I, StreamReplier<A>>
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: '@effect/sharding/StreamReplier'
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0
