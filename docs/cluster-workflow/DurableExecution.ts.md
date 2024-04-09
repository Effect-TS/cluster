---
title: DurableExecution.ts
nav_order: 4
parent: "@effect/cluster-workflow"
---

## DurableExecution overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [attempt](#attempt)
  - [kill](#kill)

---

# utils

## attempt

**Signature**

```ts
export declare function attempt<A, IA, E, IE>(
  persistenceId: string,
  success: Schema.Schema<A, IA>,
  failure: Schema.Schema<E, IE>
)
```

Added in v1.0.0

## kill

**Signature**

```ts
export declare function kill<A, IA, E, IE>(
  persistenceId: string,
  success: Schema.Schema<A, IA>,
  failure: Schema.Schema<E, IE>
)
```

Added in v1.0.0
