---
title: Replier.ts
nav_order: 17
parent: Modules
---

## Replier overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [replier](#replier)
- [models](#models)
  - [Replier (interface)](#replier-interface)
- [schema](#schema)
  - [schema](#schema-1)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)

---

# constructors

## replier

**Signature**

```ts
export declare const replier: <R>(id: ReplyId.ReplyId, schema: Schema.Schema<R, R>) => Replier<R>
```

Added in v1.0.0

# models

## Replier (interface)

**Signature**

```ts
export interface Replier<R> {
  [TypeId]: {}
  id: ReplyId.ReplyId
  schema: Schema.Schema<R>
  reply: (reply: R) => Effect.Effect<Sharding.Sharding, never, void>
}
```

Added in v1.0.0

# schema

## schema

**Signature**

```ts
export declare const schema: <A>(schema: Schema.Schema<A, A>) => Schema.Schema<Replier<A>, Replier<A>>
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: '@effect/shardcake/Replier'
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0
