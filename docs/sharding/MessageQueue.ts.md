---
title: MessageQueue.ts
nav_order: 8
parent: "@effect/sharding"
---

## MessageQueue overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [layers](#layers)
  - [inMemory](#inmemory)
- [models](#models)
  - [MessageQueue (interface)](#messagequeue-interface)
  - [MessageQueueConstructor (type alias)](#messagequeueconstructor-type-alias)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)

---

# layers

## inMemory

A layer that creates an in-memory message queue.

**Signature**

```ts
export declare const inMemory: MessageQueueConstructor<any>
```

Added in v1.0.0

# models

## MessageQueue (interface)

**Signature**

```ts
export interface MessageQueue<Msg> {
  readonly dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>
  readonly offer: (
    msg: Msg | PoisonPill.PoisonPill
  ) => Effect.Effect<never, ShardingError.ShardingErrorMessageQueue, void>
  readonly shutdown: Effect.Effect<never, never, void>
}
```

Added in v1.0.0

## MessageQueueConstructor (type alias)

**Signature**

```ts
export type MessageQueueConstructor<Msg> = (entityId: string) => Effect.Effect<never, never, MessageQueue<Msg>>
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: '@effect/sharding/MessageQueueInstance'
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0
