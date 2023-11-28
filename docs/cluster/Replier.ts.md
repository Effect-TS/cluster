---
title: Replier.ts
nav_order: 14
parent: "@effect/cluster"
---

## Replier overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [models](#models)
  - [Replier (interface)](#replier-interface)
- [schema](#schema)
  - [schema](#schema-1)
- [symbols](#symbols)
  - [ReplierTypeId](#repliertypeid)
  - [ReplierTypeId (type alias)](#repliertypeid-type-alias)
- [utils](#utils)
  - [isReplier](#isreplier)

---

# constructors

## make

**Signature**

```ts
export declare const make: <I, A>(id: ReplyId.ReplyId, schema: Schema.Schema<I, A>) => Replier<A>
```

Added in v1.0.0

# models

## Replier (interface)

**Signature**

```ts
export interface Replier<A> {
  readonly [ReplierTypeId]: ReplierTypeId
  readonly id: ReplyId.ReplyId
  readonly schema: Schema.Schema<unknown, A>
  readonly reply: (reply: A) => Effect.Effect<RecipientBehaviourContext, never, void>
}
```

Added in v1.0.0

# schema

## schema

**Signature**

```ts
export declare const schema: <I, A>(schema: Schema.Schema<I, A>) => Schema.Schema<I, Replier<A>>
```

Added in v1.0.0

# symbols

## ReplierTypeId

**Signature**

```ts
export declare const ReplierTypeId: typeof ReplierTypeId
```

Added in v1.0.0

## ReplierTypeId (type alias)

**Signature**

```ts
export type ReplierTypeId = typeof ReplierTypeId
```

Added in v1.0.0

# utils

## isReplier

**Signature**

```ts
export declare const isReplier: <A>(value: unknown) => value is Replier<A>
```

Added in v1.0.0
