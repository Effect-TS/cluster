---
title: Storage.ts
nav_order: 28
parent: "@effect/cluster"
---

## Storage overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [constructors](#constructors)
  - [make](#make)
- [context](#context)
  - [Storage](#storage)
- [layers](#layers)
  - [memory](#memory)
  - [noop](#noop)
- [models](#models)
  - [Storage (interface)](#storage-interface)
- [symbols](#symbols)
  - [StorageTypeId](#storagetypeid)
  - [StorageTypeId (type alias)](#storagetypeid-type-alias)

---

# constructors

## make

**Signature**

```ts
export declare const make: (args: Omit<Storage, typeof StorageTypeId>) => Storage
```

Added in v1.0.0

# context

## Storage

**Signature**

```ts
export declare const Storage: Context.Tag<Storage, Storage>
```

Added in v1.0.0

# layers

## memory

A layer that stores data in-memory.
This is useful for testing with a single pod only.

**Signature**

```ts
export declare const memory: Layer.Layer<Storage, never, never>
```

Added in v1.0.0

## noop

A layer that does nothing, useful for testing.

**Signature**

```ts
export declare const noop: Layer.Layer<Storage, never, never>
```

Added in v1.0.0

# models

## Storage (interface)

**Signature**

```ts
export interface Storage {
  readonly [StorageTypeId]: StorageTypeId

  /**
   * Get the current state of shard assignments to pods
   */
  readonly getAssignments: Effect.Effect<HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>>

  /**
   * Save the current state of shard assignments to pods
   */
  readonly saveAssignments: (
    assignments: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
  ) => Effect.Effect<void>

  /**
   * A stream that will emit the state of shard assignments whenever it changes
   */
  readonly assignmentsStream: Stream.Stream<HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>>

  /**
   * Get the list of existing pods
   */
  readonly getPods: Effect.Effect<HashMap.HashMap<PodAddress.PodAddress, Pod.Pod>>

  /**
   * Save the list of existing pods
   */
  readonly savePods: (pods: HashMap.HashMap<PodAddress.PodAddress, Pod.Pod>) => Effect.Effect<void>
}
```

Added in v1.0.0

# symbols

## StorageTypeId

**Signature**

```ts
export declare const StorageTypeId: typeof StorageTypeId
```

Added in v1.0.0

## StorageTypeId (type alias)

**Signature**

```ts
export type StorageTypeId = typeof StorageTypeId
```

Added in v1.0.0
