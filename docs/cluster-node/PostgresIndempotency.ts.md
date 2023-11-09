---
title: PostgresIndempotency.ts
nav_order: 3
parent: "@effect/cluster-node"
---

## PostgresIndempotency overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Itempotency (interface)](#itempotency-interface)
  - [make](#make)

---

# utils

## Itempotency (interface)

**Signature**

```ts
export interface Itempotency<R, E, M> {
  (message: M): <R2, E2, A>(use: Effect.Effect<R2, E2, A>) => Effect.Effect<R | R2, E | E2, A>
}
```

Added in v1.0.0

## make

**Signature**

```ts
export declare function make<R, E, M, T>(
  begin: (message: M) => Effect.Effect<R, E, T>,
  commit: (resource: T, message: M, reply: Option.Option<Message.Success<M>>) => Effect.Effect<R, never, void>,
  rollback: (resource: T, message: M) => Effect.Effect<R, never, void>
): Itempotency<R | RecipientBehaviour.RecipientBehaviourContext, E, M>
```

Added in v1.0.0
