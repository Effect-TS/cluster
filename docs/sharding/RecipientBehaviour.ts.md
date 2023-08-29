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
  - [RecipientContext (interface)](#recipientcontext-interface)
- [utils](#utils)
  - [EntityBehaviourOptions (type alias)](#entitybehaviouroptions-type-alias)

---

# models

## RecipientBehaviour (interface)

An alias to a RecipientBehaviour

**Signature**

```ts
export interface RecipientBehaviour<R, Req> {
  (args: RecipientContext<Req>): Effect.Effect<R, never, void>
}
```

Added in v1.0.0

## RecipientContext (interface)

The args received by the RecipientBehaviour

**Signature**

```ts
export interface RecipientContext<Req> {
  readonly entityId: string
  readonly dequeue: Queue.Dequeue<Req | PoisonPill.PoisonPill>
  readonly reply: <A extends Req & Message.Message<any>>(
    message: A,
    reply: Message.Success<A>
  ) => Effect.Effect<never, never, void>
  readonly replyStream: <A extends Req & StreamMessage.StreamMessage<any>>(
    message: A,
    reply: Stream.Stream<never, never, StreamMessage.Success<A>>
  ) => Effect.Effect<never, never, void>
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
