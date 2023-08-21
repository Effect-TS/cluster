---
title: MessageQueue.ts
nav_order: 9
parent: Modules
---

## MessageQueue overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [context](#context)
  - [MessageQueue](#messagequeue)
- [layers](#layers)
  - [inMemory](#inmemory)
- [models](#models)
  - [MessageQueue (interface)](#messagequeue-interface)
  - [MessageQueueInstance (interface)](#messagequeueinstance-interface)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)

---

# context

## MessageQueue

**Signature**

```ts
export declare const MessageQueue: Tag<MessageQueue, MessageQueue>
```

Added in v1.0.0

# layers

## inMemory

A layer that creates an in-memory message queue.

**Signature**

```ts
export declare const inMemory: Layer.Layer<never, never, MessageQueue>
```

Added in v1.0.0

# models

## MessageQueue (interface)

**Signature**

```ts
export interface MessageQueue {
  readonly _id: TypeId
  readonly make: <Msg>(
    recipientType: RecipientType.RecipientType<Msg>,
    entityId: string
  ) => Effect.Effect<Scope.Scope, never, MessageQueueInstance<Msg>>
}
```

Added in v1.0.0

## MessageQueueInstance (interface)

**Signature**

```ts
export interface MessageQueueInstance<Msg> {
  readonly dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>
  readonly offer: (msg: Msg | PoisonPill.PoisonPill) => Effect.Effect<never, never, void>
}
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: '@effect/shardcake/MessageQueueInstance'
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0
