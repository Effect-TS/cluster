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

- [models](#models)
  - [RecipientBehaviour (interface)](#recipientbehaviour-interface)
- [utils](#utils)
  - [EntityBehaviourOptions (type alias)](#entitybehaviouroptions-type-alias)
  - [fromFunctionEffect](#fromfunctioneffect)
  - [fromInMemoryQueue](#frominmemoryqueue)

---

# models

## RecipientBehaviour (interface)

An alias to a RecipientBehaviour

**Signature**

```ts
export interface RecipientBehaviour<R, Msg extends Message.Any>
  extends Effect.Effect<
    R | RecipientBehaviourContext.RecipientBehaviourContext | Scope.Scope,
    never,
    <A extends Msg>(
      message: A
    ) => Effect.Effect<
      never,
      ShardingError.ShardingErrorWhileOfferingMessage,
      MessageState.MessageState<Message.Success<A>>
    >
  > {}
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

## fromFunctionEffect

**Signature**

```ts
export declare const fromFunctionEffect: <R, Msg extends Message.Any>(
  handler: (entityId: string, message: Msg) => Effect.Effect<R, never, MessageState.MessageState<Message.Success<Msg>>>
) => RecipientBehaviour<R, Msg>
```

Added in v1.0.0

## fromInMemoryQueue

**Signature**

```ts
export declare const fromInMemoryQueue: <R, Msg extends Message.Any>(
  handler: (
    entityId: string,
    dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>,
    processed: <A extends Msg>(msg: A, value: Option.Option<Message.Success<A>>) => Effect.Effect<never, never, void>
  ) => Effect.Effect<R, never, void>
) => RecipientBehaviour<R, Msg>
```

Added in v1.0.0
