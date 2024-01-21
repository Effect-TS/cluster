---
title: RecipientBehaviour.ts
nav_order: 14
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
  - [fromFunctionEffectStateful](#fromfunctioneffectstateful)
  - [fromInMemoryQueue](#frominmemoryqueue)

---

# models

## RecipientBehaviour (interface)

An alias to a RecipientBehaviour

**Signature**

```ts
export interface RecipientBehaviour<R, Msg>
  extends Effect.Effect<
    R | RecipientBehaviourContext.RecipientBehaviourContext | Scope.Scope,
    never,
    <A extends Msg>(
      message: A
    ) => Effect.Effect<
      never,
      ShardingError.ShardingErrorWhileOfferingMessage,
      MessageState.MessageState<Message.MessageWithResult.Exit<A>>
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
export declare const fromFunctionEffect: <R, Msg>(
  handler: (
    entityId: string,
    message: Msg
  ) => Effect.Effect<R, never, MessageState.MessageState<Message.MessageWithResult.Exit<Msg>>>
) => RecipientBehaviour<R, Msg>
```

Added in v1.0.0

## fromFunctionEffectStateful

**Signature**

```ts
export declare const fromFunctionEffectStateful: <R, S, R2, Msg>(
  initialState: (entityId: string) => Effect.Effect<R, never, S>,
  handler: (
    entityId: string,
    message: Msg,
    stateRef: Ref.Ref<S>
  ) => Effect.Effect<R2, never, MessageState.MessageState<Message.MessageWithResult.Exit<Msg>>>
) => RecipientBehaviour<R | R2, Msg>
```

Added in v1.0.0

## fromInMemoryQueue

**Signature**

```ts
export declare const fromInMemoryQueue: <R, Msg>(
  handler: (
    entityId: string,
    dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>,
    processed: <A extends Msg>(
      message: A,
      value: Option.Option<Message.MessageWithResult.Exit<A>>
    ) => Effect.Effect<never, never, void>
  ) => Effect.Effect<R, never, void>
) => RecipientBehaviour<R, Msg>
```

Added in v1.0.0
