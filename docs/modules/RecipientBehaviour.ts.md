---
title: RecipientBehaviour.ts
nav_order: 18
parent: Modules
---

## RecipientBehaviour overview

A module that provides utilities to build basic behaviours

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [models](#models)
  - [RecipientBehaviour (interface)](#recipientbehaviour-interface)
- [utils](#utils)
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

## process

An utility that process a message at a time, or interrupts on PoisonPill

**Signature**

```ts
export declare const process: <Msg, R, E>(
  dequeue: Queue.Dequeue<PoisonPill.PoisonPill | Msg>,
  process: (message: Msg) => Effect.Effect<R, E, void>
) => Effect.Effect<R, E, never>
```

Added in v1.0.0
