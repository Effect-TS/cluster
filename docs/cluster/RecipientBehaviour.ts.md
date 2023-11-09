---
title: RecipientBehaviour.ts
nav_order: 15
parent: "@effect/cluster"
---

## RecipientBehaviour overview

A module that provides utilities to build basic behaviours

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [context](#context)
  - [RecipientBehaviourContext](#recipientbehaviourcontext)
- [models](#models)
  - [RecipientBehaviour (interface)](#recipientbehaviour-interface)
  - [RecipientBehaviourContext (interface)](#recipientbehaviourcontext-interface)
- [utils](#utils)
  - [EntityBehaviourOptions (type alias)](#entitybehaviouroptions-type-alias)
  - [fromInMemoryQueue](#frominmemoryqueue)
  - [mapOffer](#mapoffer)

---

# context

## RecipientBehaviourContext

A tag to access current RecipientBehaviour

**Signature**

```ts
export declare const RecipientBehaviourContext: Tag<RecipientBehaviourContext, RecipientBehaviourContext>
```

Added in v1.0.0

# models

## RecipientBehaviour (interface)

An alias to a RecipientBehaviour

**Signature**

```ts
export interface RecipientBehaviour<R, Msg> {
  (
    entityId: string
  ): Effect.Effect<
    R | RecipientBehaviourContext | Scope.Scope,
    never,
    (message: Msg) => Effect.Effect<never, ShardingError.ShardingErrorMessageQueue, void>
  >
}
```

Added in v1.0.0

## RecipientBehaviourContext (interface)

The context where a RecipientBehaviour is running, knows the current entityId, entityType, etc...

**Signature**

```ts
export interface RecipientBehaviourContext {
  readonly entityId: string
  readonly reply: (replyId: ReplyId.ReplyId, reply: unknown) => Effect.Effect<never, never, void>
}
```

Added in v1.0.0

# utils

## EntityBehaviourOptions (type alias)

An utility that process a message at a time, or interrupts on PoisonPill

**Signature**

```ts
export type EntityBehaviourOptions = {
  entityMaxIdleTime?: Option.Option<Duration.Duration>
}
```

Added in v1.0.0

## fromInMemoryQueue

**Signature**

```ts
export declare function fromInMemoryQueue<R, Msg>(
  handler: (entityId: string, dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>) => Effect.Effect<R, never, void>
): RecipientBehaviour<R, Msg>
```

Added in v1.0.0

## mapOffer

**Signature**

```ts
export declare function mapOffer<Msg1, Msg>(
  f: (
    offer: (message: Msg1) => Effect.Effect<never, ShardingError.ShardingErrorMessageQueue, void>
  ) => (message: Msg) => Effect.Effect<never, ShardingError.ShardingErrorMessageQueue, void>
)
```

Added in v1.0.0
