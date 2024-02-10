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
export declare const atLeastOnceRecipientBehaviour: <Msg, R>(
  fa: RecipientBehaviour.RecipientBehaviour<Msg, R>
) => RecipientBehaviour.RecipientBehaviour<Msg, AtLeastOnceStorage.AtLeastOnceStorage | R>
```

Added in v1.0.0

# utils

## runPendingMessageSweeperScoped

**Signature**

```ts
export declare const runPendingMessageSweeperScoped: (
  interval: Duration.Duration
) => Effect.Effect<void, never, AtLeastOnceStorage.AtLeastOnceStorage | Sharding.Sharding | Scope.Scope>
```

Added in v1.0.0
