---
title: ReplyChannel.ts
nav_order: 19
parent: Modules
---

## ReplyChannel overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [models](#models)
  - [ReplyChannel (interface)](#replychannel-interface)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)

---

# models

## ReplyChannel (interface)

**Signature**

```ts
export interface ReplyChannel<A> {
  /**
   * @since 1.0.0
   */
  _id: TypeId
  /**
   * @since 1.0.0
   */
  await: Effect.Effect<never, never, void>
  /**
   * @since 1.0.0
   */
  end: Effect.Effect<never, never, void>
  /**
   * @since 1.0.0
   */
  fail(cause: Cause.Cause<Throwable>): Effect.Effect<never, never, void>
  /**
   * @since 1.0.0
   */
  replySingle(a: A): Effect.Effect<never, never, void>
  /**
   * @since 1.0.0
   */
  replyStream(stream: Stream.Stream<never, Throwable, A>): Effect.Effect<never, never, void>
}
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: '@effect/shardcake/ReplyChannel'
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0
