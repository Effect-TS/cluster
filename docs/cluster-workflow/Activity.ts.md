---
title: Activity.ts
nav_order: 1
parent: "@effect/cluster-workflow"
---

## Activity overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [currentAttempt](#currentattempt)
  - [make](#make)
  - [persistenceId](#persistenceid)

---

# utils

## currentAttempt

**Signature**

```ts
export declare const currentAttempt: Effect.Effect<any, unknown, unknown>
```

Added in v1.0.0

## make

**Signature**

```ts
export declare function make<A, IA, E, IE>(
  activityId: string,
  success: Schema.Schema<A, IA>,
  failure: Schema.Schema<E, IE>
)
```

Added in v1.0.0

## persistenceId

**Signature**

```ts
export declare const persistenceId: Effect.Effect<any, unknown, unknown>
```

Added in v1.0.0
