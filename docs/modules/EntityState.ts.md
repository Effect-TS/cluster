---
title: EntityState.ts
nav_order: 5
parent: Modules
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
  binaryQueue: EntityState['binaryQueue'],
  entityManager: EntityState['entityManager']
): EntityState
```

Added in v1.0.0

# models

## EntityState (interface)

**Signature**

```ts
export interface EntityState {
  [TypeId]: {}
  binaryQueue: Queue.Queue<
    readonly [
      BinaryMessage.BinaryMessage,
      Deferred.Deferred<ShardError.Throwable, Option.Option<ByteArray.ByteArray>>,
      Deferred.Deferred<never, void>
    ]
  >
  entityManager: EntityManager.EntityManager<never>
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
