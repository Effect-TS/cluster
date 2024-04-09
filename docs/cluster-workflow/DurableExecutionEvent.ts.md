---
title: DurableExecutionEvent.ts
nav_order: 5
parent: "@effect/cluster-workflow"
---

## DurableExecutionEvent overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [DurableExecutionEvent (type alias)](#durableexecutionevent-type-alias)
  - [DurableExecutionEventAttempted](#durableexecutioneventattempted)
  - [DurableExecutionEventAttempted (interface)](#durableexecutioneventattempted-interface)
  - [DurableExecutionEventCompleted](#durableexecutioneventcompleted)
  - [DurableExecutionEventCompleted (interface)](#durableexecutioneventcompleted-interface)
  - [DurableExecutionEventEncoded (type alias)](#durableexecutioneventencoded-type-alias)
  - [DurableExecutionEventKillRequested](#durableexecutioneventkillrequested)
  - [DurableExecutionEventKillRequested (interface)](#durableexecutioneventkillrequested-interface)
  - [DurableExecutionEventKilled](#durableexecutioneventkilled)
  - [DurableExecutionEventKilled (interface)](#durableexecutioneventkilled-interface)
  - [match](#match)
  - [schema](#schema)

---

# utils

## DurableExecutionEvent (type alias)

**Signature**

```ts
export type DurableExecutionEvent<A, E> =
  | DurableExecutionEventAttempted
  | DurableExecutionEventKillRequested
  | DurableExecutionEventKilled
  | DurableExecutionEventCompleted<A, E>
```

Added in v1.0.0

## DurableExecutionEventAttempted

**Signature**

```ts
export declare function DurableExecutionEventAttempted(sequence: number): DurableExecutionEvent<never, never>
```

Added in v1.0.0

## DurableExecutionEventAttempted (interface)

**Signature**

```ts
export interface DurableExecutionEventAttempted {
  _tag: "@effect/cluster-workflow/DurableExecutionEventAttempted"
  sequence: number
}
```

Added in v1.0.0

## DurableExecutionEventCompleted

**Signature**

```ts
export declare function DurableExecutionEventCompleted<A, E>(exit: Exit.Exit<A, E>)
```

Added in v1.0.0

## DurableExecutionEventCompleted (interface)

**Signature**

```ts
export interface DurableExecutionEventCompleted<A, E> {
  _tag: "@effect/cluster-workflow/DurableExecutionEventCompleted"
  sequence: number
  exit: Exit.Exit<A, E>
}
```

Added in v1.0.0

## DurableExecutionEventEncoded (type alias)

**Signature**

```ts
export type DurableExecutionEventEncoded<IE, IA> =
  | {
      readonly _tag: "@effect/cluster-workflow/DurableExecutionEventAttempted"
      readonly sequence: number
    }
  | {
      readonly _tag: "@effect/cluster-workflow/DurableExecutionEventKillRequested"
      readonly sequence: number
    }
  | {
      readonly _tag: "@effect/cluster-workflow/DurableExecutionEventKilled"
      readonly sequence: number
    }
  | {
      readonly _tag: "@effect/cluster-workflow/DurableExecutionEventCompleted"
      readonly sequence: number
      readonly exit: Schema.ExitEncoded<IE, IA>
    }
```

Added in v1.0.0

## DurableExecutionEventKillRequested

**Signature**

```ts
export declare function DurableExecutionEventKillRequested(sequence: number): DurableExecutionEvent<never, never>
```

Added in v1.0.0

## DurableExecutionEventKillRequested (interface)

**Signature**

```ts
export interface DurableExecutionEventKillRequested {
  _tag: "@effect/cluster-workflow/DurableExecutionEventKillRequested"
  sequence: number
}
```

Added in v1.0.0

## DurableExecutionEventKilled

**Signature**

```ts
export declare function DurableExecutionEventKilled(sequence: number): DurableExecutionEvent<never, never>
```

Added in v1.0.0

## DurableExecutionEventKilled (interface)

**Signature**

```ts
export interface DurableExecutionEventKilled {
  _tag: "@effect/cluster-workflow/DurableExecutionEventKilled"
  sequence: number
}
```

Added in v1.0.0

## match

**Signature**

```ts
export declare function match<A, E, B, C = B, D = C, F = D>(fns: {
  onAttempted: (event: DurableExecutionEventAttempted) => B
  onKillRequested: (event: DurableExecutionEventKillRequested) => C
  onKilled: (event: DurableExecutionEventKilled) => D
  onCompleted: (event: DurableExecutionEventCompleted<A, E>) => F
})
```

Added in v1.0.0

## schema

**Signature**

```ts
export declare function schema<A, IA, E, IE>(
  success: Schema.Schema<A, IA>,
  failure: Schema.Schema<E, IE>
): Schema.Schema<DurableExecutionEvent<A, E>, DurableExecutionEventEncoded<IA, IE>>
```

Added in v1.0.0
