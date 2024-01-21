---
title: AtLeastOnce.ts
nav_order: 1
parent: "@effect/cluster"
---

## AtLeastOnce overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [atLeastOnceRecipientBehaviour](#atleastoncerecipientbehaviour)
- [utils](#utils)
  - [runPendingMessageSweeperScoped](#runpendingmessagesweeperscoped)

---

# constructors

## atLeastOnceRecipientBehaviour

**Signature**

```ts
export declare const atLeastOnceRecipientBehaviour: <R, Msg>(
  fa: RecipientBehaviour.RecipientBehaviour<R, Msg>
) => RecipientBehaviour.RecipientBehaviour<AtLeastOnceStorage.AtLeastOnceStorage | R, Msg>
```

Added in v1.0.0

# utils

## runPendingMessageSweeperScoped

**Signature**

```ts
export declare const runPendingMessageSweeperScoped: (
  interval: Duration.Duration
) => Effect.Effect<AtLeastOnceStorage.AtLeastOnceStorage | Sharding.Sharding | Scope.Scope, never, void>
```

Added in v1.0.0
