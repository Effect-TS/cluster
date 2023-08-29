---
title: RecipientBehaviour.ts
nav_order: 16
parent: "@effect/sharding"
---

## RecipientBehaviour overview

A module that provides utilities to build basic behaviours

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [models](#models)
  - [RecipientBehaviour (interface)](#recipientbehaviour-interface)
- [utils](#utils)
  - [EntityBehaviourOptions (type alias)](#entitybehaviouroptions-type-alias)
  - [process](#process)

---

# models

## RecipientBehaviour (interface)

An alias to a RecipientBehaviour

**Signature**

```ts
export interface RecipientBehaviour<R, Req> {
  (entityId: string, dequeue: Queue.Dequeue<Req | PoisonPill.PoisonPill>): Effect.Effect<R, never, void>
}
```

Added in v1.0.0

# utils

## EntityBehaviourOptions (type alias)

An utility that process a message at a time, or interrupts on PoisonPill

**Signature**

```ts
export type EntityBehaviourOptions<Req> = {
  messageQueueConstructor?: MessageQueueConstructor<Req>
  entityMaxIdleTime?: Option.Option<Duration.Duration>
}
```

Added in v1.0.0

## process

An utility that process a message at a time, or interrupts on PoisonPill

**Signature**

```ts
export declare const process: <Msg, R, E>(
  dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>,
  process: (message: Msg) => Effect.Effect<R, E, void>
) => Effect.Effect<R, E, never>
```

Added in v1.0.0
