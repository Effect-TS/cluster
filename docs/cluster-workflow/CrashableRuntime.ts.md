---
title: CrashableRuntime.ts
nav_order: 3
parent: "@effect/cluster-workflow"
---

## CrashableRuntime overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [CrashableRuntime (interface)](#crashableruntime-interface)
  - [CrashableRuntimeCrashedError (class)](#crashableruntimecrashederror-class)
  - [CrashableRuntimeScheduler (class)](#crashableruntimescheduler-class)
    - [shouldYield (method)](#shouldyield-method)
    - [scheduleTask (method)](#scheduletask-method)
    - [crash (method)](#crash-method)
    - [crashed (property)](#crashed-property)
  - [isCrashableRuntimeCrashedError](#iscrashableruntimecrashederror)
  - [make](#make)
  - [retryWhileCrashes](#retrywhilecrashes)
  - [runWithCrash](#runwithcrash)

---

# utils

## CrashableRuntime (interface)

**Signature**

```ts
export interface CrashableRuntime {
  /**
   * @since 1.0.0
   */
  crash: Effect.Effect<void>

  /**
   * @since 1.0.0
   */
  run: <A, E, R>(
    fn: (restore: <A2, E2, R2>(fa: Effect.Effect<A2, E2, R2>) => Effect.Effect<A2, E2, R2>) => Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E | CrashableRuntimeCrashedError, R>
}
```

Added in v1.0.0

## CrashableRuntimeCrashedError (class)

**Signature**

```ts
export declare class CrashableRuntimeCrashedError
```

Added in v1.0.0

## CrashableRuntimeScheduler (class)

**Signature**

```ts
export declare class CrashableRuntimeScheduler { constructor(readonly baseScheduler: Scheduler.Scheduler) }
```

Added in v1.0.0

### shouldYield (method)

**Signature**

```ts
shouldYield(fiber: RuntimeFiber<unknown, unknown>): number | false
```

Added in v1.0.0

### scheduleTask (method)

**Signature**

```ts
scheduleTask(task: Scheduler.Task, priority: number): void
```

Added in v1.0.0

### crash (method)

**Signature**

```ts
crash()
```

Added in v1.0.0

### crashed (property)

**Signature**

```ts
crashed: boolean
```

Added in v1.0.0

## isCrashableRuntimeCrashedError

**Signature**

```ts
export declare function isCrashableRuntimeCrashedError(value: unknown): value is CrashableRuntimeCrashedError
```

Added in v1.0.0

## make

**Signature**

```ts
export declare const make: Effect.Effect<CrashableRuntime, never, never>
```

Added in v1.0.0

## retryWhileCrashes

**Signature**

```ts
export declare function retryWhileCrashes<R, E, A>(
  fn: (runtime: CrashableRuntime) => Effect.Effect<R, E | CrashableRuntimeCrashedError, A>
): Effect.Effect<R, Exclude<E, CrashableRuntimeCrashedError>, A>
```

Added in v1.0.0

## runWithCrash

**Signature**

```ts
export declare function runWithCrash<R, E, A>(
  fn: (crash: Effect.Effect<never>) => Effect.Effect<R, E | CrashableRuntimeCrashedError, A>
): Effect.Effect<R, E | CrashableRuntimeCrashedError, A>
```

Added in v1.0.0
