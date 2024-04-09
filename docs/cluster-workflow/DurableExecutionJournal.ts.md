---
title: DurableExecutionJournal.ts
nav_order: 6
parent: "@effect/cluster-workflow"
---

## DurableExecutionJournal overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [DurableExecutionJournal](#durableexecutionjournal)
  - [DurableExecutionJournal (interface)](#durableexecutionjournal-interface)
  - [append](#append)
  - [read](#read)
  - [withState](#withstate)

---

# utils

## DurableExecutionJournal

**Signature**

```ts
export declare const DurableExecutionJournal: Context.Tag<DurableExecutionJournal, DurableExecutionJournal>
```

Added in v1.0.0

## DurableExecutionJournal (interface)

**Signature**

```ts
export interface DurableExecutionJournal {
  read<A, IA, E, IE>(
    persistenceId: string,
    success: Schema.Schema<A, IA>,
    failure: Schema.Schema<E, IE>,
    fromSequence: number,
    keepReading: boolean
  ): Stream.Stream<DurableExecutionEvent.DurableExecutionEvent<A, E>>
  append<A, IA, E, IE>(
    persistenceId: string,
    success: Schema.Schema<A, IA>,
    failure: Schema.Schema<E, IE>,
    event: DurableExecutionEvent.DurableExecutionEvent<A, E>
  ): Effect.Effect<void>
}
```

Added in v1.0.0

## append

**Signature**

```ts
export declare function append<A, IA, E, IE>(
  activityId: string,
  success: Schema.Schema<A, IA>,
  failure: Schema.Schema<E, IE>,
  event: DurableExecutionEvent.DurableExecutionEvent<A, E>
)
```

Added in v1.0.0

## read

**Signature**

```ts
export declare function read<A, IA, E, IE>(
  activityId: string,
  success: Schema.Schema<A, IA>,
  failure: Schema.Schema<E, IE>,
  fromSequence: number,
  keepReading: boolean
)
```

Added in v1.0.0

## withState

**Signature**

```ts
export declare function withState<A, IA, E, IE>(
  journal: DurableExecutionJournal,
  persistenceId: string,
  success: Schema.Schema<A, IA>,
  failure: Schema.Schema<E, IE>
)
```

Added in v1.0.0
