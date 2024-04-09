---
title: WorkflowEngine.ts
nav_order: 12
parent: "@effect/cluster-workflow"
---

## WorkflowEngine overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [WorkflowEngine (interface)](#workflowengine-interface)
  - [makeScoped](#makescoped)

---

# utils

## WorkflowEngine (interface)

**Signature**

```ts
export interface WorkflowEngine<T extends Schema.TaggedRequest.Any> {
  sendDiscard: (request: T) => Effect.Effect<void>
  send: <A extends T>(request: A) => Effect.Effect<Request.Request.Success<A>, Request.Request.Error<A>>
}
```

Added in v1.0.0

## makeScoped

**Signature**

```ts
export declare function makeScoped<T extends Schema.TaggedRequest.Any, R>(
  workflow: Workflow.Workflow<T, R>
): Effect.Effect<WorkflowEngine<T>, never, R | Scope.Scope | DurableExecutionJournal.DurableExecutionJournal>
```

Added in v1.0.0
