---
title: EntityState.ts
nav_order: 5
parent: "@effect/sharding"
---

## EntityState overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [models](#models)
  - [EntityState (interface)](#entitystate-interface)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)

---

# constructors

## make

**Signature**

```ts
export declare function make(
  entityManager: EntityState['entityManager'],
  processBinary: EntityState['processBinary']
): EntityState
```

Added in v1.0.0

# models

## EntityState (interface)

**Signature**

```ts
export interface EntityState {
  readonly _id: TypeId
  readonly entityManager: EntityManager.EntityManager<never>
  readonly processBinary: (
    binaryMessage: BinaryMessage.BinaryMessage,
    replyChannel: ReplyChannel.ReplyChannel<any>
  ) => Effect.Effect<never, ShardingError.ShardingError, Option.Option<Schema.Schema<unknown, any>>>
}
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: typeof TypeId
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0
