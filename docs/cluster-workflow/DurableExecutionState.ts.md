---
title: DurableExecutionState.ts
nav_order: 8
parent: "@effect/cluster-workflow"
---

## DurableExecutionState overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [DurableExecutionState (type alias)](#durableexecutionstate-type-alias)
  - [DurableExecutionStateCompleted (class)](#durableexecutionstatecompleted-class)
  - [DurableExecutionStateKilled (class)](#durableexecutionstatekilled-class)
  - [DurableExecutionStateKilling (class)](#durableexecutionstatekilling-class)
  - [DurableExecutionStatePending (class)](#durableexecutionstatepending-class)
  - [foldDurableExecutionEvent](#folddurableexecutionevent)
  - [initialState](#initialstate)
  - [match](#match)

---

# utils

## DurableExecutionState (type alias)

**Signature**

```ts
export type DurableExecutionState<A, E> =
  | DurableExecutionStatePending
  | DurableExecutionStateKilling
  | DurableExecutionStateKilled
  | DurableExecutionStateCompleted<A, E>
```

Added in v1.0.0

## DurableExecutionStateCompleted (class)

**Signature**

```ts
export declare class DurableExecutionStateCompleted<A, E>
```

Added in v1.0.0

## DurableExecutionStateKilled (class)

**Signature**

```ts
export declare class DurableExecutionStateKilled
```

Added in v1.0.0

## DurableExecutionStateKilling (class)

**Signature**

```ts
export declare class DurableExecutionStateKilling
```

Added in v1.0.0

## DurableExecutionStatePending (class)

**Signature**

```ts
export declare class DurableExecutionStatePending
```

Added in v1.0.0

## foldDurableExecutionEvent

**Signature**

```ts
export declare function foldDurableExecutionEvent<A, E>(
  state: DurableExecutionState<A, E>,
  event: DurableExecutionEvent.DurableExecutionEvent<A, E>
): DurableExecutionState<A, E>
```

Added in v1.0.0

## initialState

**Signature**

```ts
export declare function initialState<A, E>(): DurableExecutionState<A, E>
```

Added in v1.0.0

## match

**Signature**

```ts
export declare function match<A, E, B, C = B, D = C, F = D>(
  fa: DurableExecutionState<A, E>,
  fns: {
    onPending: (a: DurableExecutionStatePending) => B
    onKilling: (a: DurableExecutionStateKilling) => C
    onKilled: (a: DurableExecutionStateKilled) => D
    onCompleted: (a: DurableExecutionStateCompleted<A, E>) => F
  }
)
```

Added in v1.0.0
