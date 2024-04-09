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
export interface RecipientBehaviour<Msg, R>
  extends Effect.Effect<
    <A extends Msg>(
      message: A
    ) => Effect.Effect<
      MessageState.MessageState<Message.Message.Exit<A>>,
      ShardingException.ExceptionWhileOfferingMessageException
    >,
    never,
    R | RecipientBehaviourContext.RecipientBehaviourContext | Scope.Scope
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
export declare const fromFunctionEffect: <Msg extends Message.Message.Any, R>(
  handler: (
    entityId: string,
    message: Msg
  ) => Effect.Effect<MessageState.MessageState<Message.Message.Exit<Msg>>, never, R>
) => RecipientBehaviour<Msg, R>
```

Added in v1.0.0

## fromFunctionEffectStateful

**Signature**

```ts
export declare const fromFunctionEffectStateful: <S, R, Msg extends Message.Message.Any, R2>(
  initialState: (entityId: string) => Effect.Effect<S, never, R>,
  handler: (
    entityId: string,
    message: Msg,
    stateRef: Ref.Ref<S>
  ) => Effect.Effect<MessageState.MessageState<Message.Message.Exit<Msg>>, never, R2>
) => RecipientBehaviour<Msg, R | R2>
```

Added in v1.0.0

## fromInMemoryQueue

**Signature**

```ts
export declare const fromInMemoryQueue: <Msg extends Message.Message.Any, R>(
  handler: (
    entityId: string,
    dequeue: Queue.Dequeue<Msg | PoisonPill.PoisonPill>,
    processed: <A extends Msg>(
      message: A,
      value: Option.Option<Message.Message.Exit<A>>
    ) => Effect.Effect<void, never, never>
  ) => Effect.Effect<void, never, R>
) => RecipientBehaviour<Msg, R>
```

Added in v1.0.0
