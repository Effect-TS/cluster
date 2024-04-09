---
title: WorkflowContext.ts
nav_order: 11
parent: "@effect/cluster-workflow"
---

## WorkflowContext overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [WorkflowContext](#workflowcontext)
  - [WorkflowContext (interface)](#workflowcontext-interface)
  - [appendToPersistenceId](#appendtopersistenceid)
  - [make](#make)
  - [setShouldInterruptCurrentFiberInActivity](#setshouldinterruptcurrentfiberinactivity)
  - [shouldInterruptCurrentFiberInActivity](#shouldinterruptcurrentfiberinactivity)

---

# utils

## WorkflowContext

**Signature**

```ts
export declare const WorkflowContext: Context.Tag<WorkflowContext, WorkflowContext>
```

Added in v1.0.0

## WorkflowContext (interface)

**Signature**

```ts
export interface WorkflowContext {
  currentAttempt: number
  makePersistenceId: (localId: string) => string
  shouldInterruptCurrentFiberInActivity: Ref.Ref<boolean>
  isGracefulShutdownHappening: Effect.Effect<boolean>
  durableExecutionJournal: DurableExecutionJournal.DurableExecutionJournal
  yieldExecution: Effect.Effect<never>
}
```

Added in v1.0.0

## appendToPersistenceId

**Signature**

```ts
export declare function appendToPersistenceId(suffix: string)
```

Added in v1.0.0

## make

**Signature**

```ts
export declare function make(args: WorkflowContext): WorkflowContext
```

Added in v1.0.0

## setShouldInterruptCurrentFiberInActivity

**Signature**

```ts
export declare const setShouldInterruptCurrentFiberInActivity: (
  value: boolean
) => Effect.Effect<void, never, WorkflowContext>
```

Added in v1.0.0

## shouldInterruptCurrentFiberInActivity

**Signature**

```ts
export declare const shouldInterruptCurrentFiberInActivity: Effect.Effect<boolean, never, WorkflowContext>
```

Added in v1.0.0
