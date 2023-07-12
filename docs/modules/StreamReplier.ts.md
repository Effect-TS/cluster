---
title: StreamReplier.ts
nav_order: 39
parent: Modules
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
export declare const streamReplier: <R>(id: ReplyId.ReplyId, schema: Schema.Schema<any, R>) => StreamReplier<R>
```

Added in v1.0.0

# models

## StreamReplier (interface)

**Signature**

```ts
export interface StreamReplier<R> {
  [TypeId]: {}
  id: ReplyId.ReplyId
  schema: Schema.Schema<any, R>
  reply: (reply: Stream.Stream<never, never, R>) => Effect.Effect<Sharding.Sharding, never, void>
}
```

Added in v1.0.0

# schema

## schema

**Signature**

```ts
export declare const schema: <A>(schema: Schema.Schema<any, A>) => Schema.Schema<any, StreamReplier<A>>
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: '@effect/shardcake/StreamReplier'
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0
