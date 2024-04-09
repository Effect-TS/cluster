---
title: Workflow.ts
nav_order: 10
parent: "@effect/cluster-workflow"
---

## Workflow overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Workflow (interface)](#workflow-interface)
  - [Workflow (namespace)](#workflow-namespace)
    - [Any (type alias)](#any-type-alias)
    - [Context (type alias)](#context-type-alias)
    - [Request (type alias)](#request-type-alias)
  - [make](#make)
  - [sleep](#sleep)
  - [timeout](#timeout)
  - [union](#union)
  - [yieldExecution](#yieldexecution)

---

# utils

## Workflow (interface)

**Signature**

```ts
export interface Workflow<T extends Schema.TaggedRequest.Any, R> {
  schema: Schema.Schema<T, unknown>
  executionId: (input: T) => string
  execute: (
    input: T
  ) => Effect.Effect<Request.Request.Success<T>, Request.Request.Error<T>, R | WorkflowContext.WorkflowContext>
}
```

Added in v1.0.0

## Workflow (namespace)

Added in v1.0.0

### Any (type alias)

**Signature**

```ts
export type Any = Workflow<any, any>
```

Added in v1.0.0

### Context (type alias)

**Signature**

```ts
export type Context<A> = A extends Workflow<any, infer R> ? R : never
```

Added in v1.0.0

### Request (type alias)

**Signature**

```ts
export type Request<A> = A extends Workflow<infer T, any> ? T : never
```

Added in v1.0.0

## make

**Signature**

```ts
export declare function make<T extends Schema.TaggedRequest.Any, R = never, I = unknown>(
  schema: Schema.Schema<T, I>,
  executionId: (input: T) => string,
  execute: (input: T) => Effect.Effect<Request.Request.Success<T>, Request.Request.Error<T>, R>
): Workflow<T, Exclude<R, WorkflowContext.WorkflowContext>>
```

Added in v1.0.0

## sleep

**Signature**

```ts
export declare const sleep: (
  persistenceId: string,
  duration: Duration.Duration
) => Effect.Effect<void, unknown, unknown>
```

Added in v1.0.0

## timeout

**Signature**

```ts
export declare const timeout: (
  persistenceId: string,
  duration: Duration.Duration
) => <R, E, A>(fa: Effect.Effect<R, E, A>) => Effect.Effect<void, unknown, unknown>
```

Added in v1.0.0

## union

**Signature**

```ts
export declare function union<WFs extends ReadonlyArray<Workflow.Any>>(...wfs: WFs)
```

Added in v1.0.0

## yieldExecution

**Signature**

```ts
export declare const yieldExecution: Effect.Effect<unknown, unknown, unknown>
```

Added in v1.0.0
