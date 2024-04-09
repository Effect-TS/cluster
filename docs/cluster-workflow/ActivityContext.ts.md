---
title: ActivityContext.ts
nav_order: 2
parent: "@effect/cluster-workflow"
---

## ActivityContext overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [ActivityContext](#activitycontext)
  - [ActivityContext (interface)](#activitycontext-interface)

---

# utils

## ActivityContext

**Signature**

```ts
export declare const ActivityContext: Context.Tag<ActivityContext, ActivityContext>
```

Added in v1.0.0

## ActivityContext (interface)

**Signature**

```ts
export interface ActivityContext {
  persistenceId: string
  currentAttempt: number
}
```

Added in v1.0.0
