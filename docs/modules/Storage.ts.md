---
title: Storage.ts
nav_order: 39
parent: Modules
---

## Storage overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [context](#context)
  - [Storage](#storage)
- [layers](#layers)
  - [memory](#memory)
  - [noop](#noop)
- [models](#models)
  - [Storage (interface)](#storage-interface)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)

---

# context

## Storage

**Signature**

```ts
export declare const Storage: Tag<Storage, Storage>
```

Added in v1.0.0

# layers

## memory

A layer that stores data in-memory.
This is useful for testing with a single pod only.

**Signature**

```ts
export declare const memory: Layer.Layer<unknown, unknown, Storage>
```

Added in v1.0.0

## noop

A layer that does nothing, useful for testing.

**Signature**

```ts
export declare const noop: Layer.Layer<never, never, Storage>
```

Added in v1.0.0

# models

## Storage (interface)

**Signature**

```ts
export interface Storage {
  /**
   * Get the current state of shard assignments to pods
   */
  readonly getAssignments: Effect.Effect<
    never,
    never,
    HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
  >

  /**
   * Save the current state of shard assignments to pods
   */
  readonly saveAssignments: (
    assignments: HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
  ) => Effect.Effect<never, never, void>

  /**
   * A stream that will emit the state of shard assignments whenever it changes
   */
  readonly assignmentsStream: Stream.Stream<
    never,
    never,
    HashMap.HashMap<ShardId.ShardId, Option.Option<PodAddress.PodAddress>>
  >

  /**
   * Get the list of existing pods
   */
  readonly getPods: Effect.Effect<never, never, HashMap.HashMap<PodAddress.PodAddress, Pod.Pod>>

  /**
   * Save the list of existing pods
   */
  readonly savePods: (pods: HashMap.HashMap<PodAddress.PodAddress, Pod.Pod>) => Effect.Effect<never, never, void>
}
```

Added in v1.0.0

# symbols

## TypeId

**Signature**

```ts
export declare const TypeId: typeof TypeId
```

Added in v1.0.0

## TypeId (type alias)

**Signature**

```ts
export type TypeId = typeof TypeId
```

Added in v1.0.0
